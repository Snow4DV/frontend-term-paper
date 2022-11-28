WayFinder = {
    createGraph: function () {
        this.graph = new Graph();
        for (let i = 0; i < lines.length; i++) {
            if (!isPortalOrDoor(lines[i])) {
                let coords = getXAndYByHTML(lines[i]);
                this.graph.addLine(coords.x1, coords.y1, lines[i].id, coords.x2, coords.y2);
            }

        }
    },
    findPath: function (startId, endId) {
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
    
        let pathNodes = this.graph.findPathWithDijkstraByIds(startWay.id, endWay.id);
    
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
    
        let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttributeNS(null, "stroke-width", 2);
        polyline.setAttributeNS(null, "stroke", "red");
        polyline.setAttributeNS(null, "fill", "none");
    
        let points = "";
    
        for (let i = 0; i < path.length; i++) {
            points += " " + path[i].x + ", " + path[i].y;
        }
        polyline.setAttribute("points", points.substring(1));
    
        document.getElementById("Rooms").parentNode.appendChild(polyline);
    
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
        return JSON.stringify({ x: this.x, y: this.y });
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
        this.addEdge(node1, node2, distance(x, y, conX, conY));
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
