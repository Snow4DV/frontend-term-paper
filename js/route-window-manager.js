var routeWindow;
var screens;
var currentScreen;
var roomScreenObjects;
var buildPathScreenObjects;

window.addEventListener("load", function() {
    roomScreenObjects = {
        name: document.getElementById("room-screen-name"),
        description: document.getElementById("room-screen-description"),
        notesTextArea: document.getElementById("room-screen-notes"),
        currentRoom: null,
        toThisRoomButton: document.getElementById("to-this-room-button"),
        fromThisRoomButton: document.getElementById("from-this-room-button")
    }
    
    buildPathScreenObjects = {
        fromInput: document.getElementById("start-p"),
        toInput: document.getElementById("dest-p")
    }

    const urlParams = new URLSearchParams(window.location.search);

    routeWindow = document.getElementById("route-window");
    screens = routeWindow.childNodes;
    currentScreen = document.getElementById("room-search");
    initBackButtons();
    initRoomScreen();
    
});




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

    switch(id) {
        case "room-search":
            if(roomScreenObjects.currentRoom != null) {
                unhighlightRoom(roomScreenObjects.currentRoom);
            }
            break;
        case "build-route-screen":
            if(object && object.from) {
                buildPathScreenObjects.fromInput.value = object.from.roomName;
                buildPathScreenObjects.fromInput.setAttribute("value", object.from.roomName);
            } else if(object && object.to) {
                buildPathScreenObjects.toInput.value = object.to.roomName;
                buildPathScreenObjects.toInput.setAttribute("value", object.to.roomName);
            }
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
            highlightRoom(object);
            break;
    }
}
