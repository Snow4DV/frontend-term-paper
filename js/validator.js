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


	if(lines[i].id.includes("_")) {
		console.log("-------------------------------------");
		actions.push(
			{
				prop: lines[i],
				type: "id-damage",
				exec: function() {
					this.prop.id=this.prop.id.split("_")[0];
				}
			}
		)
		console.log("Duplicated id is destroyed by Adobe Illustrator. Action id: " + String(actions.length - 1) + ". Line: ");
		console.log(lines[i]);
	}
}

var rooms = Array.prototype.slice.call(document.getElementById("Rooms").childNodes);

for(var i = 0; i < rooms.length; i++) {
	if(typeof(rooms[i].id) == "undefined") {
		continue;
	}
	if(rooms[i].id.includes("_")) {
		console.log("-------------------------------------");
		actions.push(
			{
				prop: rooms[i],
				type: "id-damage",
				exec: function() {
					this.prop.id=this.prop.id.split("_")[0];
				}
			}
		)
		console.log("Duplicated id is destroyed by Adobe Illustrator. Action id: " + String(actions.length - 1) + ". Room: ");
		console.log(rooms[i]);
	}
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
		} else if(actions[i].type == "id-damage") {
			console.log("Fixing id for line/room:");
			console.log(actions[i].prop.id);
			actions[i].exec();
			console.log("Fixed! New property:");
			console.log(actions[i].prop);
			console.log("-------------------------------------");
		}
	}
}

if (actions.length > 0) {
	console.log("All actions can be executed with runAllActions();")
}



