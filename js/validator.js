var getXAndYByHTML = function(node) {
	var result = {x1: null, y1: null, x2: null, y2: null} ;
	for(var attr = 0; attr < node.attributes.length; attr++) {
		if(Object.keys(result).includes(node.attributes[attr].localName)) {
			result[node.attributes[attr].localName] = node.attributes[attr].nodeValue;
		}
	}
	return result;
} 


var getClassNameByHTML = function(node) {
	return node.attributes['class'].nodeValue;
} 

var isPortalOrDoor = function(node) {
	return getClassNameByHTML(node) == "st10" || getClassNameByHTML(node) == "st11";
}





var areLinesConnected = function areLinesConnected(coords1, coords2) {
	// 1: node1 is connected to node2 with left end
	// 0: node1 is connected to node 2 with right end
	// -1: nodes are not connected
	if(coords1.x1 == coords2.x1 && coords1.y1 == coords2.y1 ||
		coords1.x1 == coords2.x2 && coords1.y1 == coords2.y2) {
			return 1;
	}
	else if(coords1.x2 == coords2.x1 && coords1.y2 == coords2.y1 ||
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

var childNodes  = Array.prototype.slice.call( paths);
childNodes = childNodes.concat(Array.prototype.slice.call( doors));
childNodes = childNodes.concat(Array.prototype.slice.call( portals));

var lines = [];

for(var i = 0; i < childNodes.length; i++) {
	if(childNodes[i].nodeName == "line") {
		lines.push(childNodes[i]);
	}		
}


console.log("-----VALIDATION STARTED---------");

console.log("Lines:");
console.log(lines);

for(var i = 0; i < lines.length; i++) {
    let foundLeftCon = false;
    let foundRightCon = false;
	
	let lineCons1 = getXAndYByHTML(lines[i]);
    for(var j = 0; j < lines.length; j++) {
		let lineCons2 = getXAndYByHTML(lines[j]);
		if(JSON.stringify(lineCons1) == JSON.stringify(lineCons2)) {
			continue;
		}
		let areLinesConnectedResult = areLinesConnected(lineCons1, lineCons2);
		if(areLinesConnectedResult == 1) {
			foundLeftCon = true;
		} else if(areLinesConnectedResult == 0) {
			foundRightCon = true;
		}
	}
	if(!(foundLeftCon && foundRightCon) && !isPortalOrDoor(lines[i])) {
		console.log("-------------------------------------");
		lines[i].setAttribute("stroke", "#FF0000");
		lines[i].removeAttribute("class");
		console.log("[RED] End is not found for: " + JSON.stringify(lineCons1));
		console.log("Is connected: left(x1,y1) - " + foundLeftCon + ", right(x2,y2) - " + foundRightCon);
		console.log(lines[i]);
		
	} else if(!foundLeftCon && !foundRightCon && isPortalOrDoor(lines[i])) {
		console.log("--------------------------------------");
			lines[i].setAttribute("stroke", "#0000FF");
		lines[i].removeAttribute("class");
		console.log("[BLUE] Door/Portal with no entries: " + JSON.stringify(lineCons1));
		console.log("Is connected: left(x1,y1) - " + foundLeftCon + ", right(x2,y2) - " + foundRightCon);
		console.log(lines[i]);
	}
}
		
		
console.log("-----VALIDATION-IS-OVER---------");
        
