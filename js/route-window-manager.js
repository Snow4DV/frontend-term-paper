var routeWindow;
var screens;
var currentScreen;
var roomScreenObjects;
var buildPathScreenObjects;
var routeReadyScreenObjects;

window.addEventListener("load", function() {
    roomScreenObjects = {
        name: document.getElementById("room-screen-name"),
        description: document.getElementById("room-screen-description"),
        notesTextArea: document.getElementById("room-screen-notes"),
        currentRoom: null,
        toThisRoomButton: document.getElementById("to-this-room-button"),
        fromThisRoomButton: document.getElementById("from-this-room-button"),
        addNotesButton: document.getElementById("add-note-for-room")
    }
    
    initBuildRouteScreen();

    routeWindow = document.getElementById("route-window");
    screens = routeWindow.childNodes;
    currentScreen = document.getElementById("room-search");
    initBackButtons();
    initRoomScreen();
    initRouteReadyScreen();
    
});


function initRouteReadyScreen() {
    routeReadyScreenObjects = {
        fromToTitle: document.getElementById("route-ready-from-to"),
        distanceTitle: document.getElementById("route-ready-distance")
    }
}
function initBuildRouteScreen() {
    buildPathScreenObjects = {
        fromInput: document.getElementById("start-p"),
        toInput: document.getElementById("dest-p"),
        fromHighlight: null,
        toHighlight: null
    }
    buildPathScreenObjects.fromInput.addEventListener("input", function() {
        let newValue = this.value;
        let fromRoom = getRoomByName(newValue);
        if(buildPathScreenObjects.fromHighlight) {
            unhighlightRoom(buildPathScreenObjects.fromHighlight);
        }
        if(fromRoom) {
            highlightRoom(fromRoom, "#5c6bc0");
            buildPathScreenObjects.fromHighlight = fromRoom;
        }
        
    });
    buildPathScreenObjects.toInput.addEventListener("input", function() {
        let newValue = this.value;
        let toRoom = getRoomByName(newValue);
        if(buildPathScreenObjects.toHighlight) {
            unhighlightRoom(buildPathScreenObjects.toHighlight);
        }
        if(toRoom) {
            highlightRoom(toRoom, "#4caf50");
            buildPathScreenObjects.toHighlight = toRoom;
        }
        
    });
}


function initRoomScreen() {
    roomScreenObjects.notesTextArea.addEventListener("change", function() {
        localStorage.setItem(roomScreenObjects.currentRoom.roomDoorId, roomScreenObjects.notesTextArea.value);
    })
   

    roomScreenObjects.toThisRoomButton.addEventListener("click", function() {
        openWindow("build-route-screen", {from: null, to: roomScreenObjects.currentRoom});
    }); 

    roomScreenObjects.fromThisRoomButton.addEventListener("click", function() {
        openWindow("build-route-screen", {from: roomScreenObjects.currentRoom, to: null});
    });

    roomScreenObjects.addNotesButton.addEventListener("click", function() {
        window.open("add-note.html?room=" + JSON.stringify(roomScreenObjects.currentRoom), "", "width=400,height=400");
    })
}


function initBackButtons() {
    let backButtons = document.getElementsByClassName("back-button");
    for(let i = 0; i < backButtons.length; i++) {
        backButtons[i].addEventListener("click", function() {
            openWindow("room-search");
        })
    }
}

function openWindow(id, object) {
    for(let i = 0; i < screens.length; i++) {
        if(id == screens[i].id && screens[i].setAttribute) {
            screens[i].setAttribute("style","display:visible"); 
        } else if(screens[i].setAttribute){
            screens[i].setAttribute("style","display:none"); 
        }
    }
    if(roomScreenObjects.currentRoom != null) {
        unhighlightRoom(roomScreenObjects.currentRoom);
    }
    switch(id) {
        case "room-search":
            removeAllPolylines();
            if(buildPathScreenObjects.fromHighlight != null) {
                unhighlightRoom(buildPathScreenObjects.fromHighlight);
            }
            if(buildPathScreenObjects.toHighlight != null) {
                unhighlightRoom(buildPathScreenObjects.toHighlight);
            }
            break;
        case "route-screen":
            routeReadyScreenObjects.fromToTitle.innerHTML = "<b>Откуда:</b> " + object.from + "<br><b>Куда:</b> " + object.to;
            routeReadyScreenObjects.distanceTitle.innerHTML = "<b>Примерное расстояние:</b> " + object.distance + " усл. метров";
            break;
        case "build-route-screen":
            if(object && object.from) {
                buildPathScreenObjects.fromInput .value = object.from.roomName;
                buildPathScreenObjects.fromInput.setAttribute("value", object.from.roomName);
            } else if(object && object.to) {
                buildPathScreenObjects.toInput.value = object.to.roomName;
                buildPathScreenObjects.toInput.setAttribute("value", object.to.roomName);
            }
            buildPathScreenObjects.fromInput.dispatchEvent(new Event('input', {bubbles:true}));
            buildPathScreenObjects.toInput.dispatchEvent(new Event('input', {bubbles:true}));
            break;
        case "room-screen":
            roomScreenObjects.name.innerHTML = object.roomName;
            roomScreenObjects.description.innerHTML = "Находится на этаже " + object.floor.replace("floor", "");
            roomScreenObjects.currentRoom = object;
            let savedNote = localStorage.getItem(roomScreenObjects.currentRoom.roomDoorId);
            roomScreenObjects.notesTextArea.value = savedNote ? savedNote : "";
            if(roomScreenObjects.notesTextArea.value != "") {
                roomScreenObjects.notesTextArea.setAttribute("value", roomScreenObjects.notesTextArea.value);
            } else {
                roomScreenObjects.notesTextArea.removeAttribute("value");
            }

            window.addEventListener('storage', function(event){
                let savedNote = localStorage.getItem(roomScreenObjects.currentRoom.roomDoorId);
                roomScreenObjects.notesTextArea.value = savedNote ? savedNote : "";
                if(roomScreenObjects.notesTextArea.value != "") {
                    roomScreenObjects.notesTextArea.setAttribute("value", roomScreenObjects.notesTextArea.value);
                } else {
                    roomScreenObjects.notesTextArea.removeAttribute("value");
                }
            });
            highlightRoom(object);
            break;
    }
}
