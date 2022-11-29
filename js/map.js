let floors = ["floor0", "floor1", "floor2", "floor3", "floor4"];

let currentFloorId = "floor2";

var setVisibleFloor = function(floorId) {
    for(let i = 0; i < floors.length; i++) {
        let floorContainer = document.getElementById(floors[i] + "-container");
        if(floors[i] != floorId) {
            floorContainer.setAttribute("hidden", "");
        } else {
            floorContainer.removeAttribute("hidden");
        }
    }
    currentFloorId = floorId;
    currentFloorG = document.getElementById(currentFloorId + "-g");
    updateTransform();
}



let map = document.getElementById("maps");
let isMouseDown = false;
let previousMouseMove = null;

let translate = {x: 0, y: 0};
let scale = {x: 1, y: 1};

let currentFloorG = document.getElementById(currentFloorId + "-g");

map.onmousedown = function() {
    isMouseDown = true;
}
map.onmouseup= function() {
    isMouseDown = false;
}
map.onmouseleave= function() {
    isMouseDown = false;
}

map.onmousemove= function(event) {
    if(isMouseDown && previousMouseMove != null) {
        let deltaX = event.x - previousMouseMove.x;
        let deltaY = event.y - previousMouseMove.y;

        translate.x += deltaX;
        translate.y += deltaY;
        updateTransform();

    } 
    previousMouseMove = event;
}

let updateTransform = function() {
    currentFloorG.setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");
}


let updateSvgViewport = function() {
    let mapSvgs = document.querySelectorAll("#maps > * > svg");
    for(let i = 0; i < mapSvgs.length; i++) {
        mapSvgs[i].setAttribute("viewBox","0 0 " + window.innerWidth + " " + window.innerHeight);
    }
}


let init = function() {
    setVisibleFloor("floor2");
    updateSvgViewport();

    map.addEventListener('wheel',function(event){

        let centerX = currentFloorG.getBBox().width/2;
        let centerY = currentFloorG.getBBox().height/2;

        let mouseX =  event.x;
        let mouseY = event.y;

        let scaleDelta = event.deltaY/1000;
        scale.x -= scaleDelta;
        scale.y -= scaleDelta;
        translate.x = centerX * (1-scale.x);
        translate.y = centerY * (1-scale.y) ;
        updateTransform();
        return false; 
    }, false);


    for(let i = 0; i < floors.length; i++) {
        let button = document.getElementById(floors[i] + "-button");
        button.addEventListener("click", (function(floorId, button) {
            setVisibleFloor(floorId);
            document.getElementsByClassName("active-fbutton")[0].setAttribute("class", "fbutton");
            button.setAttribute("class", "active-fbutton");
        }).bind(null, floors[i], button));
    }

    document.getElementById("down-floor-button").addEventListener("click", function() {
        let newFloorIndex = floors.indexOf(currentFloorId) + 1;
        if(newFloorIndex < 0) newFloorIndex = 0;
        if(newFloorIndex > floors.length - 1) newFloorIndex = floors.length - 1;
        setVisibleFloor(floors[newFloorIndex]);
        document.getElementsByClassName("active-fbutton")[0].setAttribute("class", "fbutton");
        document.getElementById(floors[newFloorIndex] + "-button").setAttribute("class", "active-fbutton");
    });
    document.getElementById("up-floor-button").addEventListener("click", function() {
        let newFloorIndex = floors.indexOf(currentFloorId) - 1;
        if(newFloorIndex < 0) newFloorIndex = 0;
        if(newFloorIndex > floors.length - 1) newFloorIndex = floors.length - 1;
        setVisibleFloor(floors[newFloorIndex]);
        document.getElementsByClassName("active-fbutton")[0].setAttribute("class", "fbutton");
        document.getElementById(floors[newFloorIndex] + "-button").setAttribute("class", "active-fbutton");
    });
}

let onResize = function() {
    updateSvgViewport();
}

window.addEventListener('load', init);
window.addEventListener('resize', onResize);

