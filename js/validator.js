var getXAndYByHTML = function (node) {
	var result = { x1: null, y1: null, x2: null, y2: null };
	for (var attr = 0; attr < node.attributes.length; attr++) {
		if (Object.keys(result).includes(node.attributes[attr].localName)) {
			result[node.attributes[attr].localName] = node.attributes[attr].nodeValue;
		}
	}
	return result;
}


var getClassNameByHTML = function (node) {
	return node.attributes['class'].nodeValue;
}

var isPortalOrDoor = function (node) {
	return node.parentElement.id == "Doors" || node.parentElement.id == "Portals";
}



var getTypeOfLine = function (node) {
	let type = node.parentElement.id;
	type = type.substring(0, type.length - 1);
	return type;
}






var areLinesConnected = function areLinesConnected(coords1, coords2) {
	// 1: node1 is connected to node2 with left end
	// 0: node1 is connected to node 2 with right end
	// -1: nodes are not connected  
	if (coords1.x1 == coords2.x1 && coords1.y1 == coords2.y1 ||
		coords1.x1 == coords2.x2 && coords1.y1 == coords2.y2) {
		return 1;
	}
	else if (coords1.x2 == coords2.x1 && coords1.y2 == coords2.y1 ||
		coords1.x2 == coords2.x2 && coords1.y2 == coords2.y2) {
		return 0;
	}
	else {
		return -1;
	}
}

var paths = document.getElementById("Paths").childNodes;
var doors = document.getElementById("Doors").childNodes;
var portals = document.getElementById("Portals").childNodes;

var childNodes = Array.prototype.slice.call(paths);
childNodes = childNodes.concat(Array.prototype.slice.call(doors));
childNodes = childNodes.concat(Array.prototype.slice.call(portals));

lines = [];

for (var i = 0; i < childNodes.length; i++) {
	if (childNodes[i].nodeName == "line") {
		lines.push(childNodes[i]);
	}
}

var updateLines = function () {
	paths = document.getElementById("Paths").childNodes;
	doors = document.getElementById("Doors").childNodes;
	portals = document.getElementById("Portals").childNodes;

	childNodes = Array.prototype.slice.call(paths);
	childNodes = childNodes.concat(Array.prototype.slice.call(doors));
	childNodes = childNodes.concat(Array.prototype.slice.call(portals));

	lines = [];

	for (var i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeName == "line") {
			lines.push(childNodes[i]);
		}
	}
}

var length = function (coords) {
	return distance(coords.x1, coords.y1, coords.x2, coords.y2);
}

var distance = function (x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

var distanceBetweenClosestEnds = function (coords1, coords2) {
	let dist1 = distance(coords1.x1, coords1.y1, coords2.x1, coords2.y1);
	let dist2 = distance(coords1.x2, coords1.y2, coords2.x1, coords2.y1);
	let dist3 = distance(coords1.x1, coords1.y1, coords2.x2, coords2.y2);
	let dist4 = distance(coords1.x2, coords1.y2, coords2.x2, coords2.y2);
	return Math.min(dist1, dist2, dist3, dist4);
}

var getSnapLine = function (coords, curIndex) {
	let minDistance = Infinity;
	let snapLine = null;



	for (var i = 0; i < lines.length; i++) {
		if (i == curIndex) {
			continue;
		}
		let compCoords = getXAndYByHTML(lines[i]);
		let compDistance = distanceBetweenClosestEnds(coords, compCoords);
		if (compDistance < minDistance) {
			snapLine = lines[i];
			minDistance = compDistance;
		}
	}

	return snapLine;
}

var distanceToClosestEnd = function (x, y, coords2) {
	let dist1 = distance(x, y, coords2.x1, coords2.y1);
	let dist2 = distance(x, y, coords2.x2, coords2.y2);
	return Math.min(dist1, dist2);
}

var getSnapLineToFreeEnd = function (x, y, curIndex) {
	let minDistance = Infinity;
	let snapLine = null;



	for (var i = 0; i < lines.length; i++) {
		if (i == curIndex) {
			continue;
		}
		let compCoords = getXAndYByHTML(lines[i]);
		let compDistance = distanceToClosestEnd(x, y, compCoords);
		if (compDistance < minDistance) {
			snapLine = lines[i];
			minDistance = compDistance;
		}
	}

	return snapLine;
}

var snap = function (line1, line2) {
	let coords1 = getXAndYByHTML(line1);
	let coords2 = getXAndYByHTML(line2);


	let dist1 = distance(coords1.x1, coords1.y1, coords2.x1, coords2.y1);
	let dist2 = distance(coords1.x2, coords1.y2, coords2.x1, coords2.y1);
	let dist3 = distance(coords1.x1, coords1.y1, coords2.x2, coords2.y2);
	let dist4 = distance(coords1.x2, coords1.y2, coords2.x2, coords2.y2);



	let min = Math.min(dist1, dist2, dist3, dist4);

	if (min == dist1) {
		line1.attributes['x1'].nodeValue = line2.attributes['x1'].nodeValue;
		line1.attributes['y1'].nodeValue = line2.attributes['y1'].nodeValue;
	} else if (min == dist2) {
		line1.attributes['x2'].nodeValue = line2.attributes['x1'].nodeValue;
		line1.attributes['y2'].nodeValue = line2.attributes['y1'].nodeValue;
	} else if (min == dist3) {
		line1.attributes['x1'].nodeValue = line2.attributes['x2'].nodeValue;
		line1.attributes['y1'].nodeValue = line2.attributes['y2'].nodeValue;
	} else {
		line1.attributes['x2'].nodeValue = line2.attributes['x2'].nodeValue;
		line1.attributes['y2'].nodeValue = line2.attributes['y2'].nodeValue;
	}
}

actions = [];

var idNotDefinedErrorWasShown = false;
var noWaysErrorWasShown = false;
var noLengthErrorWasShown = false;

var needWaysRedefineAndLinesArrayUpdate = false;

console.log("-----VALIDATION STARTED---------");

console.log("Lines:");
console.log(lines);


var announceErrorAndHighlight = function (errorString, index, coords, newColor, foundLeftCon, foundRightCon, snapLine, actionIndex) {
	console.log("-------------------------------------");
	lines[index].setAttribute("stroke", newColor);
	lines[index].removeAttribute("class");
	console.log(errorString + " " + JSON.stringify(coords) + ", index is " + index);
	console.log("Is connected: left(x1,y1) - " + foundLeftCon + ", right(x2,y2) - " + foundRightCon);
	console.log(lines[index]);
	if (snapLine) {
		console.log("Snapping can be done: actions[" + actionIndex + "]() , snappable line is: ");
		console.log(snapLine);
	}
}


for (var i = 0; i < lines.length; i++) {
	let foundLeftCon = false;
	let foundRightCon = false;

	let lineCons1 = getXAndYByHTML(lines[i]);
	for (var j = 0; j < lines.length; j++) {
		let lineCons2 = getXAndYByHTML(lines[j]);
		if (JSON.stringify(lineCons1) == JSON.stringify(lineCons2)) {
			continue;
		}
		let areLinesConnectedResult = areLinesConnected(lineCons1, lineCons2);
		if (areLinesConnectedResult == 1) {
			foundLeftCon = true;
		} else if (areLinesConnectedResult == 0) {
			foundRightCon = true;
		}
	}

	var errorString, newColor, snapLine = false;
	if (!(foundLeftCon && foundRightCon) && !isPortalOrDoor(lines[i])) {
		errorString = "[RED] End is not found for";
		newColor = "#FF0000";
		snapLine = getSnapLineToFreeEnd(!foundLeftCon ? Number(lines[i].attributes['x1'].nodeValue) : Number(lines[i].attributes['x2'].nodeValue),
			!foundLeftCon ? Number(lines[i].attributes['y1'].nodeValue) : Number(lines[i].attributes['y2'].nodeValue), i);

	} else if (!foundLeftCon && !foundRightCon && isPortalOrDoor(lines[i])) {
		errorString = "[BLUE] Door/Portal with no entries: ";
		newColor = "#0000FF";
		snapLine = getSnapLine(lineCons1, i);
	} else {
		errorString = false;
		newColor = false;
	}

	if (errorString && newColor) {
		actions.push(
			{
				exec:
					function () {
						snap(this.line, this.snapLine);
					}
				, line: lines[i]
				, snapLine: snapLine
				, type: "snap"
			});
		announceErrorAndHighlight(errorString, i, lineCons1, newColor, foundLeftCon, foundRightCon, snapLine, actions.length - 1);

	}


	if (lines[i].id.includes("_")) {
		console.log("-------------------------------------");
		actions.push(
			{
				prop: lines[i],
				type: "id-damage",
				exec: function () {
					this.prop.id = this.prop.id.split("_")[0];
				}
			}
		)
		console.log("Duplicated id is destroyed by Adobe Illustrator. Action id: " + String(actions.length - 1) + ". Line: ");
		console.log(lines[i]);
	}


	if (getTypeOfLine(lines[i]) == "Door" && lines[i].getAttribute("ways") != null && lines[i].getAttribute("ways").includes(",")) {
		console.log("-------------------------------------");
		actions.push(
			{
				prop: lines[i],
				type: "door-multiple-connections",
				exec: function () {
					let lineCoords = getXAndYByHTML(this.prop);
					lineCoords.x1 = Number(lineCoords.x1);
					lineCoords.y1 = Number(lineCoords.y1);
					lineCoords.x2 = Number(lineCoords.x2);
					lineCoords.y2 = Number(lineCoords.y2);

					let pathLineNextToDoorCoords = getXAndYByHTML(getLineById(this.prop.getAttribute("ways").split(",")[0]));

					let doorConnectionStatus = areLinesConnected(lineCoords, pathLineNextToDoorCoords);  // 1 - left-connected; 0 - right-connected

					let connectionX, connectionY; // Coordinates on which door is connected to multiple paths

					let midX = (lineCoords.x1 + lineCoords.x2) / 2.0;
					let midY = (lineCoords.y1 + lineCoords.y2) / 2.0;

					if (doorConnectionStatus == 1) {
						connectionX = lineCoords.x1;
						connectionY = lineCoords.y1;

						this.prop.setAttribute("x1", midX);
						this.prop.setAttribute("y1", midY);
					} else {
						connectionX = lineCoords.x2;

						this.prop.setAttribute("x2", midX);
						this.prop.setAttribute("y2", midY);
					}

					var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
					newLine.setAttribute('id', 'doorline' + i);
					newLine.setAttribute('x1', midX);
					newLine.setAttribute('y1', midY);
					newLine.setAttribute('x2', connectionX);
					newLine.setAttribute('y2', connectionY);
					newLine.setAttribute("stroke", "black");

					document.getElementById("Paths").appendChild(newLine);
				}
			}
		)
		needWaysRedefineAndLinesArrayUpdate = true; // To redefine ways again because connections were modified. 
		console.log("Door multiple connections. Action id: " + String(actions.length - 1) + ". Line: ");
		console.log(lines[i]);
	}

	if (lines[i].id == "" && !idNotDefinedErrorWasShown) {
		console.log("-------------------------------------");
		actions.push(
			{
				type: "id-missing",
				exec: function () {
					defineIds();
				}
			}
		)
		console.log("Some lines don't have IDs. Action id: " + String(actions.length - 1));
		idNotDefinedErrorWasShown = true;
	}

	if (lines[i].getAttribute("ways") == null && !noWaysErrorWasShown) {
		console.log("-------------------------------------");
		actions.push(
			{
				type: "no-ways",
				exec: function () {
					predefineConnections();
				}
			}
		)
		noWaysErrorWasShown = true;
		console.log("Some lines don't have predefined ways. Action id: " + String(actions.length - 1));
	}
	if (lines[i].getAttribute("length") == null && !noLengthErrorWasShown) {
		console.log("-------------------------------------");
		actions.push(
			{
				type: "no-length",
				exec: function () {
					predefineLengths();
				}
			}
		);
		noLengthErrorWasShown = true;
		console.log("Some lines don't have predefined lengths. Action id: " + String(actions.length - 1));
	}
}


var rooms = Array.prototype.slice.call(document.getElementById("Rooms").childNodes);

for (var i = 0; i < rooms.length; i++) {
	if (typeof (rooms[i].id) == "undefined") {
		continue;
	}
	if (rooms[i].id.includes("_")) {
		console.log("-------------------------------------");
		actions.push(
			{
				prop: rooms[i],
				type: "id-damage",
				exec: function () {
					this.prop.id = this.prop.id.split("_")[0];
				}
			}
		)
		console.log("Duplicated id is destroyed by Adobe Illustrator. Action id: " + String(actions.length - 1) + ". Room: ");
		console.log(rooms[i]);
	}
}

if(needWaysRedefineAndLinesArrayUpdate) {
	console.log("-------------------------------------");
		actions.push(
			{
				type: "need-line-array-update-and-ways-redef",
				exec: function () {
					updateLines();
					predefineConnections();
				}
			}
		);
		noLengthErrorWasShown = true;
		console.log("Some lines don't have predefined lengths. Action id: " + String(actions.length - 1));
}

console.log("-----VALIDATION-IS-OVER---------");
console.log("Errors counter: " + actions.length);
console.log("-----------------RESULT---------");


runAllActions = function () {
	console.log("-----RUNNING-ALL-ACTIONS---------");
	for (var i = 0; i < actions.length; i++) {
		if (actions[i].type == "snap") {
			console.log("Snapping this line:");
			console.log(getXAndYByHTML(actions[i].line));
			console.log("to this line:");
			console.log(actions[i].snapLine);
			actions[i].exec();
			console.log("Done. New line is:");
			console.log(actions[i].line);
			console.log("-------------------------------------");
		} else if (actions[i].type == "id-damage") {
			console.log("Fixing id for line/room:");
			console.log(actions[i].prop.id);
			actions[i].exec();
			console.log("Fixed! New property:");
			console.log(actions[i].prop);
			console.log("-------------------------------------");
		} else if (actions[i].type == "id-missing") {
			actions[i].exec();
			console.log("ID was defined for all lines that didn't have it.");
			console.log("-------------------------------------");
		} else if (actions[i].type == "no-ways") {
			actions[i].exec();
			console.log("Ways were generated for every line.");
			console.log("-------------------------------------");
		} else if (actions[i].type == "no-length") {

			actions[i].exec();
			console.log("Lengths were generated for every line.");
			console.log("-------------------------------------");
		} else if (actions[i].type == "door-multiple-connections") {
			actions[i].exec();
			console.log("Door line was splitted:");
			console.log(actions[i].prop);
			console.log("-------------------------------------");
		} else if(actions[i].type == "need-line-array-update-and-ways-redef") {
			actions[i].exec();
			console.log("Lines array was updated and ways were generated for every line.");
			console.log("-------------------------------------");
		}
	}
	console.log("------ALL-ACTIONS-ARE-DONE------");

}

if (actions.length > 0) {
	console.log("All actions can be executed with runAllActions();")
}

var defineIds = function () {
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].id == "") {
			lines[i].id = "line" + i;
		}
	}
}


var predefineConnections = function () {
	for (let i = 0; i < lines.length; i++) {
		let curLineCoords = getXAndYByHTML(lines[i]);
		lines[i].setAttribute("ways", "");
		for (let j = 0; j < lines.length; j++) {
			if (i == j) continue;

			let compLineCoords = getXAndYByHTML(lines[j]);
			let distanceBetweenLines = distanceBetweenClosestEnds(curLineCoords, compLineCoords);

			if (distanceBetweenLines <= Number.EPSILON) {
				lines[i].setAttribute("ways", lines[i].getAttribute("ways") + (lines[i].getAttribute("ways").length == 0 ? "" : ",") + lines[j].id);
			}
		}
	}
}

var predefineLengths = function () {
	for (let i = 0; i < lines.length; i++) {
		let foundLength = String(length(getXAndYByHTML(lines[i])));
		lines[i].setAttribute("length", foundLength);
	}

}

var getChildElementById = function (parentId, childId) {
	return document.querySelectorAll('#' + parentId + ' > #' + childId)[0];
}

var getLineById = function (childId) {
	let curLine = document.querySelectorAll('#Paths > #' + childId)[0];
	if (curLine == null) {
		curLine = document.querySelectorAll('#Doors > #' + childId)[0];
	}
	if (curLine == null) {
		curLine = document.querySelectorAll("#Portals > #" + childId)[0];
	}
	return curLine;
}

var getConnectedNodes = function (node) {
	let ways = node.getAttribute("ways").split(",");
	let result = [];
	for (let i = 0; i < ways.length; i++) {
		result.push(getLineById(ways[i]));
	}
	return result;
}


var createGraph = function () {
	graph = new Graph();
	for (let i = 0; i < lines.length; i++) {
		if (!isPortalOrDoor(lines[i])) {
			let coords = getXAndYByHTML(lines[i]);
			graph.addLine(coords.x1, coords.y1, lines[i].id, coords.x2, coords.y2);
		}

	}

	findPath = function (startId, endId) {
		let startLine = getLineById(startId);
		let endLine = getLineById(endId);

		let startWay = getLineById(startLine.getAttribute("ways"));
		let endWay = getLineById(endLine.getAttribute("ways"));

		// These variables are used to determine which coords are first on the pathand which are the second - for start: non-connected coords come first, connected - second (because we are coming out of the class)
		// for end: connected coords come first, non-connected - second.
		// Because connected ones are already added (because they are also present in the non-door line that is connected to the door line) - we simply add non-connected end of start-door to the beginning of the path
		// and non-connected end of end-door to the end of tha path
		let startConnectionStatus = areLinesConnected(getXAndYByHTML(startLine), getXAndYByHTML(startWay));  // 1 - left-connected; 0 - right-connected
		let endConnectionStatus = areLinesConnected(getXAndYByHTML(endLine), getXAndYByHTML(endWay)); // 1 - left-connected; 0 - right-connected

		let startLineCoords = getXAndYByHTML(startLine);
		let endLineCoords = getXAndYByHTML(endLine);

		let path = [];

		path.push(
			{
				x: (startConnectionStatus == 1) ? startLineCoords.x2 : startLineCoords.x1,
				y: (startConnectionStatus == 1) ? startLineCoords.y2 : startLineCoords.y1
			}
		);

		let pathNodes = graph.findPathWithDijkstraByIds(startWay.id, endWay.id);

		for (let i = 0; i < pathNodes.length; i++) {
			path.push(
				{
					x: pathNodes[i].x,
					y: pathNodes[i].y
				}
			);
		}


		path.push(
			{
				x: (endConnectionStatus == 1) ? endLineCoords.x2 : endLineCoords.x1,
				y: (endConnectionStatus == 1) ? endLineCoords.y2 : endLineCoords.y1
			}
		);

		console.log("PATH: ");
		console.log(path);

		let polyline = document.getElementById("result-polyline");

		let points = "";

		for (let i = 0; i < path.length; i++) {
			points += " " + path[i].x + ", " + path[i].y;
		}
		polyline.setAttribute("points", points.substring(1));

	}
}

class GraphNode {
	constructor(x, y, id) {
		this.x = x;
		this.y = y;
		this.connectedIds = [];
		this.connectedIds.push(id);
	}

	addConnectedId(id) {
		this.connectedIds.push(id);
	}

	getConnectedIds() {
		return [...this.connectedIds];
	}

	equals(x, y) {
		return this.x == x && this.y == y;
	}

	checkIfIdIsPresent(id) {
		for (let i = 0; i < this.connectedIds.length; i++) {
			if (this.connectedIds[i] == id) {
				return true;
			}
		}
		return false;
	}

	key() {
		return JSON.stringify({ x: this.x, y: this.y });
	}


}

class Graph {

	constructor() {
		this.nodes = [];
		this.adjacencyList = {};
	}

	addLine(x, y, id, conX, conY) {
		let node1 = this.addNode(x, y, id);
		let node2 = this.addNode(conX, conY, id);
		this.addEdge(node1, node2, distance(x, y, conX, conY));
	}

	addNode(x, y, id) {
		let addNode = this.getNodeByCoords(x, y);
		if (addNode == null) {
			let newNode = new GraphNode(x, y, id);
			this.nodes.push(newNode);
			this.adjacencyList[newNode.key()] = [];
			return newNode;
		} else {
			addNode.addConnectedId(id);
			return addNode;
		}

	}

	distance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}




	getNodeById(id) {
		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].checkIfIdIsPresent(id)) {
				return this.nodes[i];
			}
		}
		return null;
	}


	getNodeByCoords(x, y) {
		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].x == x && this.nodes[i].y == y) {
				return this.nodes[i];
			}
		}
		return null;
	}
	checkIfNodeExistsById(id) {
		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].checkIfIdIsPresent(id)) {
				return true;
			}
		}
		return false;
	}


	addEdge(node1, node2, weight) {
		this.adjacencyList[node1.key()].push({ node: node2, weight: weight });
		this.adjacencyList[node2.key()].push({ node: node1, weight: weight });
	}

	findPathWithDijkstraByIds(startId, endId) {
		return this.findPathWithDijkstra(this.getNodeById(startId), this.getNodeById(endId));
	}

	findPathWithDijkstra(startNode, endNode) {
		let times = {};
		let backtrace = {};
		let pq = new PriorityQueue();

		times[startNode.key()] = 0;

		this.nodes.forEach(node => {
			if (node.key() !== startNode.key()) {
				times[node.key()] = Infinity;
			}
		});

		pq.enqueue([startNode, 0]);

		while (!pq.isEmpty()) {
			let shortestStep = pq.dequeue();
			let currentNode = shortestStep[0];
			this.adjacencyList[currentNode.key()].forEach(neighbor => {
				let time = times[currentNode.key()] + neighbor.weight;

				if (time < times[neighbor.node.key()]) {
					times[neighbor.node.key()] = time;
					backtrace[neighbor.node.key()] = currentNode;
					pq.enqueue([neighbor.node, time]);
				}
			});
		}

		let path = [endNode];
		let lastStep = endNode;
		while (lastStep !== startNode) {
			path.unshift(backtrace[lastStep.key()])
			lastStep = backtrace[lastStep.key()]
		}
		console.log(`Path is ${path.length} and time is ${times[endNode.key()]}`);
		console.log(path);
		return path
	}
}

class PriorityQueue {
	constructor() {
		this.collection = [];
	}

	enqueue(element) {
		if (this.isEmpty()) {
			this.collection.push(element);
		} else {
			let added = false;
			for (let i = 1; i <= this.collection.length; i++) {
				if (element[1] < this.collection[i - 1][1]) {
					this.collection.splice(i - 1, 0, element);
					added = true;
					break;
				}
			}
			if (!added) {
				this.collection.push(element);
			}
		}
	};

	dequeue() {
		let value = this.collection.shift();
		return value;
	};
	isEmpty() {
		return (this.collection.length === 0)
	};
}

var roomUpdateFunc = function (shape, title, rooms, index, nextCall, oldClass) {
	shape.parentElement.removeChild(shape);

	if (title != null) title.parentElement.removeChild(title);


	let newGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
	newGroup.appendChild(shape);
	if (title != null) newGroup.appendChild(title);


	let newId = prompt("Enter new id for " + "aud" + index + " or BREAK to stop:");
	shape.setAttributeNS(null, "class", oldClass);
	shape.removeAttribute("fill");
	if (newId == "BREAK") {
		return;
	}
	newGroup.setAttribute("id", newId);
	rooms.appendChild(newGroup);


	nextCall();


}

var moveRoomsAction = function () {
	moveRoomsToSeparateLayer(["aud", "wc", "din"]);
}


var unred = function () {
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].getAttribute("stroke") != null) {
			let newColor = "";

			switch (getTypeOfLine(lines[i])) {
				case "Door":
					newColor = "#00FF00";
					break;
				case "Portal":
					newColor = "#A020F0";
					break;
				case "Path":
					newColor = "#000000";
					break;
			}
			lines[i].setAttribute("stroke", newColor);
		}
	}
}


var moveRoomsToSeparateLayer = function (prefixes, roomsIndex, rooms, curPrefix) {
	if (rooms == null) {
		rooms = document.getElementById("Rooms");
	}
	if (roomsIndex == null) {
		roomsIndex = 0;
	}

	if (curPrefix == null) {
		prefix = 0;
	}

	if (curPrefix == null) {
		curPrefix = prefixes.pop();
	}

	if (roomsIndex > 2000 && prefixes.length > 0) {
		curPrefix = prefixes.pop();
		roomsIndex = 0;
	} else if (roomsIndex > 2000) {
		return;
	}
	let shape = getChildElementById("svgMap", curPrefix + roomsIndex);
	let title = getChildElementById("svgMap", curPrefix + roomsIndex + "_0");

	if (shape != null) {
		let oldClass = shape.getAttributeNS(null, "class");
		shape.setAttributeNS(null, "class", "");
		shape.setAttributeNS(null, "fill", "#FF0000");
		setTimeout(roomUpdateFunc.bind(null, shape, title, rooms, roomsIndex, moveRoomsToSeparateLayer.bind(null, prefixes, roomsIndex + 1, rooms, curPrefix), oldClass), 70); // Dumb hack - we have to wait until browser updates the svg. Otherwise prompt hangs everything
	} else {
		moveRoomsToSeparateLayer(prefixes, ++roomsIndex, rooms, curPrefix);
	}


}


var nameDoorsAccordingToRoomNames = function () {
	let rooms = document.getElementById("Rooms").childNodes;
	let doors = document.getElementById("Doors").childNodes;

	for (let j = 0; j < doors.length; j++) {
		if (doors[j].nodeType == 3) continue; // Text nodes are being skipped

		let lineCoords = getXAndYByHTML(doors[j]);

		if (doors[j].getAttribute("ways") == "" || doors[j].getAttribute("ways") == null) {
			console.error("Door doesn't have ways:");
			console.error(doors[j]);
			return;
		}

		let pathLineNextToDoorCoords = getXAndYByHTML(getLineById(doors[j].getAttribute("ways")));

		let doorConnectionStatus = areLinesConnected(lineCoords, pathLineNextToDoorCoords);  // 1 - left-connected; 0 - right-connected

		let freeX, freeY; // intersectionCoords - free end

		if (doorConnectionStatus == 1) { // if so - search for right end intersection
			freeX = lineCoords.x2;
			freeY = lineCoords.y2;
		} else {
			freeX = lineCoords.x1;
			freeY = lineCoords.y1;
		}



		for (let i = 0; i < rooms.length; i++) {
			if (rooms[i].nodeType == 3) continue; // Text nodes are being skipped

			if (rooms[i].childNodes[1] != null) {
				let bbox = rooms[i].childNodes[1].getBBox();
				if ((freeX >= bbox.x && freeX <= bbox.x + bbox.width) && (freeY >= bbox.y && freeY <= bbox.y + bbox.height)) {
					console.log("CONNECTING DOOR ");
					console.log(doors[j]);
					console.log("TO ROOM:");
					console.log(rooms[i]);
				}
			}
		}
	}
}