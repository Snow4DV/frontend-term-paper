let escapeDot = function (nonEscapedString) {
    return nonEscapedString.replaceAll(".", "\\.");
}
let removeAllPolylines = function () {
    let polylines = document.querySelectorAll("polyline");
    for (let i = 0; i < polylines.length; i++) {
        polylines[i].parentNode.removeChild(polylines[i]);
    }
}
WayFinder = {
    floorHeight: 200, // pixels
    floors: ["floor0", "floor1", "floor2", "floor3", "floor4"],
    compareFloors: function (floor1, floor2) {
        let floor1Number = Number(floor1.replace(/\D/g, ""));
        let floor2Number = Number(floor2.replace(/\D/g, ""));
        return floor1Number - floor2Number; // if (==0) then floors equal. if (>0) then floor1 is greater. if(<0) then floor1 is smaller
    },
    getLinesForFloor: function (floor) {
        let paths = document.getElementById(floor + "-container").querySelectorAll("#Paths>*");
        let doors = document.getElementById(floor + "-container").querySelectorAll("#Doors>*");
        let portals = document.getElementById(floor + "-container").querySelectorAll("#Portals>*");

        let childNodes = Array.prototype.slice.call(paths);
        childNodes = childNodes.concat(Array.prototype.slice.call(doors));
        childNodes = childNodes.concat(Array.prototype.slice.call(portals));

        let lines = [];

        for (let i = 0; i < childNodes.length; i++) { // To skip anything but lines 
            if (childNodes[i].nodeName == "line") {
                lines.push(childNodes[i]);
            }
        }
        return lines;
    },
    areLinesConnected: function (coords1, coords2) {
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
    },
    getLineById: function (childId) {
        let curLine = document.querySelectorAll('#Paths > #' + childId)[0];
        if (curLine == null) {
            curLine = document.querySelectorAll('#Doors > #' + childId)[0];
        }
        if (curLine == null) {
            curLine = document.querySelectorAll("#Portals > #" + childId)[0];
        }
        return curLine;
    },
    distance: function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    },
    isPortalOrDoor: function (node) {
        return node.parentElement.id == "Doors" || node.parentElement.id == "Portals";
    },
    getXAndYByHTML: function (node) {
        var result = { x1: null, y1: null, x2: null, y2: null };
        for (var attr = 0; attr < node.attributes.length; attr++) {
            if (Object.keys(result).includes(node.attributes[attr].localName)) {
                result[node.attributes[attr].localName] = node.attributes[attr].nodeValue;
            }
        }
        return result;
    },
    getTypeOfLine: function (node) {
        let type = node.parentElement.id;
        return type.substring(0, type.length - 1);
    },
    createGraph: function () {
        this.graph = new Graph();

        for (let i = 0; i < this.floors.length; i++) {
            let floor = this.floors[i];
            let floorLines = this.getLinesForFloor(floor);
            for (let j = 0; j < floorLines.length; j++) {
                if (this.getTypeOfLine(floorLines[j]) == "Path") {
                    let coords = this.getXAndYByHTML(floorLines[j]);
                    this.graph.addLine(coords.x1, coords.y1, floorLines[j].id, coords.x2, coords.y2, floor, floor);
                } else if (this.getTypeOfLine(floorLines[j]) == "Portal") {
                    let coords = this.getXAndYByHTML(floorLines[j]);
                    let portalWays = floorLines[j].getAttribute("ways");
                    if (portalWays == null) {
                        continue;
                    } else {
                        portalWays = portalWays.split(",");
                    }
                    this.graph.addLine(coords.x1, coords.y1, floorLines[j].id, coords.x2, coords.y2, floor, floor);
                    for (let k = 0; k < portalWays.length; k++) {
                        let dstNode = document.querySelector("#" + escapeDot(portalWays[k]));
                        if (portalWays[k].split(".").length > 0 && portalWays[k].split(".")[2] != floor && this.getTypeOfLine(dstNode) == "Portal") { // Check "if it is a portal to another floor" is implemented
                            let dstPortal = dstNode;
                            let dstCoords = this.getXAndYByHTML(dstPortal);
                            if (this.compareFloors(floorLines[j].id, dstPortal.id) > 0) {
                                this.graph.addLine(coords.x2, coords.y2, floorLines[j].id + "-to-" + dstPortal.id, dstCoords.x1, dstCoords.y1, floor, portalWays[k].split(".")[2]); // Fake line between portals. It's a portal between floors so it will not be drawn
                                // Note that it will be added only once because of the comparison. [btw it is newer zero because zero will not be passed]
                            }
                        }

                    }
                }
            }
        }
    },
    findPath: function (startId, endId) {
        removeAllPolylines();
        let startLine = this.getLineById(startId);
        let endLine = this.getLineById(endId);

        let startWay = this.getLineById(startLine.getAttribute("ways"));
        let endWay = this.getLineById(endLine.getAttribute("ways"));

        // These variables are used to determine which coords are first on the pathand which are the second - for start: non-connected coords come first, connected - second (because we are coming out of the class)
        // for end: connected coords come first, non-connected - second.
        // Because connected ones are already added (because they are also present in the non-door line that is connected to the door line) - we simply add non-connected end of start-door to the beginning of the path
        // and non-connected end of end-door to the end of tha path
        let startConnectionStatus = this.areLinesConnected(this.getXAndYByHTML(startLine), this.getXAndYByHTML(startWay));  // 1 - left-connected; 0 - right-connected
        let endConnectionStatus = this.areLinesConnected(this.getXAndYByHTML(endLine), this.getXAndYByHTML(endWay)); // 1 - left-connected; 0 - right-connected

        let startLineCoords = this.getXAndYByHTML(startLine);
        let endLineCoords = this.getXAndYByHTML(endLine);

        let path = [];

        path.push(
            {
                x: (startConnectionStatus == 1) ? startLineCoords.x2 : startLineCoords.x1,
                y: (startConnectionStatus == 1) ? startLineCoords.y2 : startLineCoords.y1,
                floor: document.getElementById(startId).parentNode.parentNode.parentNode.id
            }
        );

        let searchResult = this.graph.findPathWithDijkstraByIds(startWay.id, endWay.id);

        let pathNodes = searchResult.path;
        let distance = searchResult.distance;

        for (let i = 0; i < pathNodes.length; i++) {
            path.push(
                {
                    x: pathNodes[i].x,
                    y: pathNodes[i].y,
                    floor: pathNodes[i].floor
                }
            );
        }


        path.push(
            {
                x: (endConnectionStatus == 1) ? endLineCoords.x2 : endLineCoords.x1,
                y: (endConnectionStatus == 1) ? endLineCoords.y2 : endLineCoords.y1,
                floor: document.getElementById(endId).parentNode.parentNode.parentNode.id
            }
        );

        console.log("PATH: ");
        console.log(path);

        let resultWay = {};


        /*
        <animate attributeName="points" dur="5s" repeatCount="indefinite"
    from="100,100 900,100 900,900 100,900 100,100"
      to="200,200 800,500 800,500 200,800 200,200"
  />*/

        let lastFloor = "";
        for (let i = 0; i < path.length; i++) {
            //points += " " + path[i].x + ", " + path[i].y;
            if (path[i].floor != lastFloor) {
                lastFloor = path[i].floor;
                let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                polyline.setAttributeNS(null, "stroke-width", 2);
                polyline.setAttributeNS(null, "stroke", "red");
                polyline.setAttributeNS(null, "fill", "none");
                polyline.setAttributeNS(null, "class", "path-polyline");


                let animation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                animation.setAttribute("attributeName", "points");
                animation.setAttribute("dur", "5s");
                animation.setAttribute("class", "path-polyline-animation");
                animation.setAttribute("repeatCount", "indefinite");
                animation.setAttribute("values", " " + path[i].x + ", " + path[i].y);
                polyline.appendChild(animation);

                if (!resultWay[path[i].floor]) {
                    resultWay[path[i].floor] = [];
                }
                resultWay[path[i].floor].push(polyline);


            } else {
                resultWay[path[i].floor][resultWay[path[i].floor].length - 1].childNodes[0].setAttribute("values", resultWay[path[i].floor][resultWay[path[i].floor].length - 1].childNodes[0].getAttribute("values") + " " + path[i].x + ", " + path[i].y);
            }
        }

        let resultWayKeys = Object.keys(resultWay);

        for (let i = 0; i < resultWayKeys.length; i++) {
            let floor = resultWayKeys[i];
            for (let j = 0; j < resultWay[floor].length; j++) {
                let polyline = resultWay[floor][j];
                document.getElementById(floor + "-g").appendChild(polyline);
            }
        }
        return searchResult;
        
    }
}





class GraphNode {
    constructor(x, y, id, floor) {
        this.x = x;
        this.y = y;
        this.connectedIds = [];
        this.connectedIds.push(id);
        this.floor = floor;
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
        return JSON.stringify({ x: this.x, y: this.y, floor: this.floor });
    }


}

class Graph {

    constructor() {
        this.nodes = [];
        this.adjacencyList = {};
    }

    addLine(x, y, id, conX, conY, floor1, floor2) {
        let node1 = this.addNode(x, y, id, floor1);
        let node2 = this.addNode(conX, conY, id, floor2);
        let distance;
        if (floor1 == floor2) {
            distance = WayFinder.distance(x, y, conX, conY);
        } else {
            distance = Math.abs(WayFinder.compareFloors(floor1, floor2)) * WayFinder.floorHeight;
        }

        this.addEdge(node1, node2, distance);
    }

    addNode(x, y, id, floor) {
        let addNode = this.getNodeByCoords(x, y);
        if (addNode == null) {
            let newNode = new GraphNode(x, y, id, floor);
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
            console.log(lastStep);
            path.unshift(backtrace[lastStep.key()]);
            lastStep = backtrace[lastStep.key()];
        }
        console.log(`Path is ${path.length} and time is ${times[endNode.key()]}`);
        console.log(path);
        return { path: path, distance: times[endNode.key()] };
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




