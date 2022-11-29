let floors = ["floor0", "floor1", "floor2", "floor3", "floor4"];

let currentFloorId = "floor2";

var setVisibleFloor = function (floorId) {
    for (let i = 0; i < floors.length; i++) {
        let floorContainer = document.getElementById(floors[i] + "-container");
        if (floors[i] != floorId) {
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
let isMouseOrFingerDown = false;
let previousMouseMove = null;

let translate = { x: 0, y: 0 };
let scale = { x: 1, y: 1 };

let currentFloorG = document.getElementById(currentFloorId + "-g");

map.onmousedown = function () {
    isMouseOrFingerDown = true;
}
map.onmouseup = function () {
    isMouseOrFingerDown = false;
}
map.onmouseleave = function () {
    isMouseOrFingerDown = false;
}

map.ontouchstart = function() {
    isMouseOrFingerDown = true;
}

map.ontouchend = function () {
    isMouseOrFingerDown = false;
}

map.ontouchcancel = function () {
    isMouseOrFingerDown = false;
}


map.onmousemove = function (event) {
    if (isMouseOrFingerDown && previousMouseMove != null) {
        let deltaX = event.x - previousMouseMove.x;
        let deltaY = event.y - previousMouseMove.y;

        translate.x += deltaX;
        translate.y += deltaY;
        updateTransform();

    }
    previousMouseMove = event;
}
map.ontouchmove = map.onmousemove;

let updateTransform = function () {
    currentFloorG.setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");
}


let updateSvgViewport = function () {
    let mapSvgs = document.querySelectorAll("#maps > * > svg");
    for (let i = 0; i < mapSvgs.length; i++) {
        mapSvgs[i].setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    }
}


let init = function () {
    setVisibleFloor("floor2");
    updateSvgViewport();

    map.addEventListener('wheel', function (event) {

        let centerX = currentFloorG.getBBox().width / 2;
        let centerY = currentFloorG.getBBox().height / 2;

        let mouseX = event.x; // FIXME: Zoom
        let mouseY = event.y;

        let scaleDelta = event.deltaY / 1000;
        scale.x -= scaleDelta;
        scale.y -= scaleDelta;
        translate.x = centerX * (1 - scale.x);
        translate.y = centerY * (1 - scale.y);
        updateTransform();
        return false;
    }, false);


    for (let i = 0; i < floors.length; i++) {
        let button = document.getElementById(floors[i] + "-button");
        button.addEventListener("click", (function (floorId, button) {
            setVisibleFloor(floorId);
            document.getElementsByClassName("active-fbutton")[0].setAttribute("class", "fbutton");
            button.setAttribute("class", "active-fbutton fbutton");
        }).bind(null, floors[i], button));
    }

    document.getElementById("down-floor-button").addEventListener("click", function () {
        let newFloorIndex = floors.indexOf(currentFloorId) + 1;
        if (newFloorIndex < 0) newFloorIndex = 0;
        if (newFloorIndex > floors.length - 1) newFloorIndex = floors.length - 1;
        setVisibleFloor(floors[newFloorIndex]);
        document.getElementsByClassName("active-fbutton")[0].setAttribute("class", "fbutton");
        document.getElementById(floors[newFloorIndex] + "-button").setAttribute("class", "active-fbutton fbutton");
    });
    document.getElementById("up-floor-button").addEventListener("click", function () {
        let newFloorIndex = floors.indexOf(currentFloorId) - 1;
        if (newFloorIndex < 0) newFloorIndex = 0;
        if (newFloorIndex > floors.length - 1) newFloorIndex = floors.length - 1;
        setVisibleFloor(floors[newFloorIndex]);
        document.getElementsByClassName("active-fbutton")[0].setAttribute("class", "fbutton");
        document.getElementById(floors[newFloorIndex] + "-button").setAttribute("class", "active-fbutton fbutton");
    });
    WayFinder.createGraph();

}

var transliterateArray = {"A" : "А", "B": "Б", "V" : "В", "G":"Г","D":"Д","L":"Л", "YO":"Ё","I":"И","C":"Ц","U":"У","K":"К","E":"Э","N":"Н","G":"Г","SH":"Ш","SCH":"Щ","Z":"З","H":"Х","'":"ь","yo":"ё","i":"и","ts":"ц","u":"у","k":"к","e":"э","n":"н","g":"г","sh":"ш","sch":"щ","z":"з","h":"х","F":"Ф","V":"В","А":"А","P":"П","R":"Р","O":"О","L":"Л","D":"Д","ZH":"Ж","f":"ф","v":"в","a":"а","p":"п","r":"р","o":"о","l":"л","d":"д","zh":"ж","Ya":"Я","CH":"Ч","S":"С","M":"М","T":"Т","B":"Б","YU":"Ю","ya":"я","ch":"ч","s":"с","m":"м","t":"т","b":"б","yu":"ю"};



function transliterate(word){
  return word.split('').map(function (char) { 
    return transliterateArray[char] || char; 
  }).join("");
}


var FloorMap = {
    convertDoorIdToCyrillicAudName: function (roomId, floor) { // door id of room, without -floor0 stuff
        let roomIdSplit = roomId.split("-");
        let resultRoomName = "";
        if (roomIdSplit[0] == "WC" && roomIdSplit.length >= 3) {
            let gender = "";
            switch (resultRoomName[1]) {
                case "F":
                    gender = "ж.";
                    break;
                case "M":
                    gender = "м. ";
                    break;
                case "FM":
                case "MF":
                    gender = "м./ж.";
            }
            resultRoomName = "Туалет " + gender + " в корпусе " + transliterate(roomIdSplit[2]);
        }   

        else if(roomIdSplit[0] == "CANTEEN"  && roomIdSplit.length >= 2) {
            resultRoomName = "Столовая " + transliterate(roomIdSplit[1]);
        }
        else if(roomIdSplit[0] == "SECURITY") {
            resultRoomName = "Охрана";
        } 
        else if(roomIdSplit[0] == "GYM") {
            resultRoomName = "Физкультурный зал";
        }
        else if(roomIdSplit == "DRESSING") {
            resultRoomName = "Гардероб";
            if(roomIdSplit.length >= 3) {
                resultRoomName += " " + roomIdSplit[2];
            }
        }
        else if(/^L[0-9]{3}$/.test(roomIdSplit[0])) {
            resultRoomName = "Библиотека " + roomIdSplit[0].replace("L","");
        } else {
            resultRoomName = transliterate(roomIdSplit[0]);
            for(let i = 1; i < roomIdSplit.length;i++) {
                resultRoomName += "-" + transliterate(roomIdSplit[i]);
            }
        }

        return resultRoomName;

    },
    getRooms: function () {
        let roomsContainers = document.querySelectorAll("#Rooms > g ");
        let roomsObjects = [];

        for (let i = 0; i < roomsContainers.length; i++) {
            let roomIdSplit = roomsContainers[i].id.split("-");
            console.log(roomIdSplit);
            let roomDoorId = "";
            let floor = "";
            for (let j = 0; j < roomIdSplit.length; j++) {
                if (j != roomIdSplit.length - 1) {
                    roomDoorId += ((j == 0) ? "" : "-") + roomIdSplit[j];
                } else {
                    floor = roomIdSplit[j]; // last thing is floorId
                }
            }
            let roomObject = {
                roomGroupId: roomsContainers[i].id,
                roomDoorId: roomDoorId,
                roomName: FloorMap.convertDoorIdToCyrillicAudName(roomDoorId, floor),
                floor: floor
            }
            roomsObjects.push(roomObject);
        }

        return roomsObjects;


    }
}


let onResize = function () {
    updateSvgViewport();
}

window.addEventListener('load', init);
window.addEventListener('resize', onResize);



