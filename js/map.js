let floors = ["floor0", "floor1", "floor2", "floor3", "floor4"];

var currentZoom = {};

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
    updateSvgViewport();
}

let map = document.getElementById("maps");
let isMouseOrFingerDown = false;
let previousMouseOrFingerMove = null;

let leftTopPoint = { x: 620, y: -50 };
let scale = 0.9;

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

function distance(event) {
    return Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY);
};

map.ontouchstart = function (event) {
    isMouseOrFingerDown = true;
    currentZoom = {};
    if (event.touches.length === 2) {
        event.preventDefault();
        currentZoom.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        currentZoom.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        currentZoom.distance = distance(event);
    }
    previousMouseOrFingerMove = event;
}

map.ontouchend = function () {
    isMouseOrFingerDown = false;
    previousMouseOrFingerMove = null;
    currentZoom = {};
}

map.ontouchcancel = function () {
    isMouseOrFingerDown = false;
    previousMouseOrFingerMove = null;
    currentZoom = {};
}


map.onmousemove = function (event) {
    if (isMouseOrFingerDown && previousMouseOrFingerMove != null) {
        let deltaX = event.x - previousMouseOrFingerMove.x;
        let deltaY = event.y - previousMouseOrFingerMove.y;



        leftTopPoint.x -= deltaX / scale;
        leftTopPoint.y -= deltaY / scale;
        updateSvgViewport();

    }
    previousMouseOrFingerMove = event;
}
map.ontouchmove = function (event) {
    if (event.touches.length == 2) {
        event.preventDefault();

        let oldDimensions = { width: window.innerWidth / scale, height: window.innerHeight / scale };

        const deltaDistance = distance(event);
        let zoomDelta = deltaDistance / currentZoom.distance;
        let zoomMultiplier = 2.6;
        if(scale > 0.45) zoomMultiplier = 1; // Make zoom faster when map is bigger
        scale = Math.min(Math.max((scale - (1 -zoomDelta)/zoomMultiplier), 0.1), 3);

        const xRel = ((event.touches[0].pageX + event.touches[1].pageX) / 2)/window.innerWidth; 
        const yRel = ((event.touches[0].pageY + event.touches[1].pageY) / 2)/window.innerHeight;

        currentZoom.distance = deltaDistance;

        let newDimensions = { width: window.innerWidth / scale, height: window.innerHeight / scale };



        leftTopPoint.x += (oldDimensions.width - newDimensions.width) * xRel;
        leftTopPoint.y += (oldDimensions.height - newDimensions.height) * yRel;

        updateSvgViewport();

        
    } else if (event.touches.length == 1 && isMouseOrFingerDown && previousMouseOrFingerMove != null) {
        const deltaX = event.touches[0].screenX - (previousMouseOrFingerMove != null ? previousMouseOrFingerMove.touches[0].screenX : 0);
        const deltaY = event.touches[0].screenY - (previousMouseOrFingerMove != null ? previousMouseOrFingerMove.touches[0].screenY : 0);
        leftTopPoint.x -= deltaX / scale;
        leftTopPoint.y -= deltaY / scale;
        updateSvgViewport();
    }
    previousMouseOrFingerMove = event;
}


let updateSvgViewport = function () {
    let mapSvgs = document.querySelectorAll("#maps > * > svg");
    for (let i = 0; i < mapSvgs.length; i++) {
        //mapSvgs[i].setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
        let width = window.innerWidth / scale;
        let height = window.innerHeight / scale;
        mapSvgs[i].setAttribute("viewBox", (leftTopPoint.x) + " " + (leftTopPoint.y) + " " + (width) + " " + (height));

    }
}


let init = function () {
    setVisibleFloor("floor2");
    updateSvgViewport();

    map.addEventListener('wheel', function (event) {

        let oldDimensions = { width: window.innerWidth / scale, height: window.innerHeight / scale };

        scale += event.wheelDeltaY > 0 ? 0.15 : -0.15;

        if (scale < 0.1) scale = 0.1;

        let newDimensions = { width: window.innerWidth / scale, height: window.innerHeight / scale };


        let xRel = event.clientX / window.innerWidth;
        let yRel = event.clientY / window.innerHeight;

        leftTopPoint.x += (oldDimensions.width - newDimensions.width) * xRel;
        leftTopPoint.y += (oldDimensions.height - newDimensions.height) * yRel;






        //leftTopPoint.x += (oldDimensions.width - newDimensions.width) * scale ;
        //leftTopPoint.y += (oldDimensions.height - newDimensions.height) * scale;





        //leftTopPoint.x -= offsetX/scale;
        //leftTopPoint.y -= offsetY/scale;


        updateSvgViewport();




        /*let mult = event.wheelDeltaY > 0 ? -0.1 : 0.1;
        scale -= mult;
        scale -= mult;

        let oldBoundingRect = currentFloorG.getBoundingClientRect();

        updateTransform();
        let newBoundingRect = currentFloorG.getBoundingClientRect();

        var xRel = event.clientX - oldBoundingRect.left; 
        var yRel = event.clientY - oldBoundingRect.top; 


        let offsetX = (newBoundingRect.width - oldBoundingRect.width)*((xRel * (1.015))/oldBoundingRect.width);

        let offsetY = (newBoundingRect.height - oldBoundingRect.height)*((yRel * 1.02)/oldBoundingRect.height);
        //console.log({xRel2: xRel/oldBoundingRect.width, yRel2: yRel/oldBoundingRect.height});
        //console.log({clientX: event.clientX, clientY: event.clientY});

        //console.log({xRel: xRel, yRel: yRel});
        //console.log(oldBoundingRect);
        //translate.x -= offsetX;
        //translate.y -= offsetY;
        console.log(oldBoundingRect);
        console.log(newBoundingRect);
        console.log({offsetX: offsetX, offsetY: offsetY});
        console.log({xDelta: newBoundingRect.width - oldBoundingRect.width, yDelta: newBoundingRect.height - oldBoundingRect.height});
        console.log({xRel: xRel, yRel: yRel});

        console.log("--------");

        updateTransform();

      */
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

var transliterateArray = { "A": "А", "B": "Б", "V": "В", "G": "Г", "D": "Д", "L": "Л", "YO": "Ё", "I": "И", "C": "Ц", "U": "У", "K": "К", "E": "Э", "N": "Н", "G": "Г", "SH": "Ш", "SCH": "Щ", "Z": "З", "H": "Х", "'": "ь", "yo": "ё", "i": "и", "ts": "ц", "u": "у", "k": "к", "e": "э", "n": "н", "g": "г", "sh": "ш", "sch": "щ", "z": "з", "h": "х", "F": "Ф", "V": "В", "А": "А", "P": "П", "R": "Р", "O": "О", "L": "Л", "D": "Д", "ZH": "Ж", "f": "ф", "v": "в", "a": "а", "p": "п", "r": "р", "o": "о", "l": "л", "d": "д", "zh": "ж", "Ya": "Я", "CH": "Ч", "S": "С", "M": "М", "T": "Т", "B": "Б", "YU": "Ю", "ya": "я", "ch": "ч", "s": "с", "m": "м", "t": "т", "b": "б", "yu": "ю" };



function transliterate(word) {
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
            switch (roomIdSplit[1]) {
                case "F":
                    gender = "ж.";
                    break;
                case "M":
                    gender = "м.";
                    break;
                case "FM":
                case "MF":
                    gender = "м./ж.";
            }
            resultRoomName = "Туалет " + gender + " " + transliterate(roomIdSplit[2]);
            if(roomIdSplit[3]) {
                resultRoomName += "-" + roomIdSplit[3];
            }
        }

        else if (roomIdSplit[0] == "CANTEEN" && roomIdSplit.length >= 2) {
            resultRoomName = "Столовая " + transliterate(roomIdSplit[1]);
        }
        else if (roomIdSplit[0] == "SECURITY") {
            resultRoomName = "Охрана";
        }
        else if (roomIdSplit[0] == "GYM") {
            resultRoomName = "Физкультурный зал";
        }
        else if (roomIdSplit[0] == "DRESSING") {
            resultRoomName = "Гардероб";
            if (roomIdSplit.length >= 3) {
                resultRoomName += " " + roomIdSplit[2];
            }
        }
        else if (roomIdSplit[0] == "ENTRANCE") {
            resultRoomName = "Вход";
        }
        else if (roomIdSplit[0] == "PASS") {
            resultRoomName = "Бюро пропусков";
        }
        else if (roomIdSplit[0] == "COPY") {
            resultRoomName = "Копирка";
        }
        else if (roomIdSplit[0] == "CAFFEE") {
            resultRoomName = "Кафе";
        }
        else if(roomIdSplit[0] == "COMMENDA") {
            resultRoomName = "Ключи";
        }
        else if(roomIdSplit[0] == "SMALL" && roomIdSplit[1] == "CAFFEE") {
            resultRoomName = "Буфет " + roomIdSplit[2];
        }
        else if(roomIdSplit[0] == "LIB") {
            resultRoomName = "Читательный зал " + roomIdSplit[1];
        }
        else if (/^L[0-9]{3}$/.test(roomIdSplit[0])) {
            resultRoomName = "Библиотека " + roomIdSplit[0].replace("L", "");
        } else {
            resultRoomName = transliterate(roomIdSplit[0]);
            for (let i = 1; i < roomIdSplit.length; i++) {
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



