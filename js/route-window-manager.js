var routeWindow;
var screens;
var currentScreen;

window.addEventListener("load", function() {
    routeWindow = document.getElementById("route-window");
    screens = routeWindow.childNodes;
    currentScreen = document.getElementById("room-search");
    initBackButtons();
    initRoomScreen();
});

var roomScreenObjects = {
    name: document.getElementById("room-screen-name"),
    description: document.getElementById("room-screen-description"),
    notesTextArea: document.getElementById("room-screen-notes"),
    currentRoom: null
}

function initRoomScreen() {
    roomScreenObjects.notesTextArea.addEventListener("change", function() {
        localStorage.setItem(roomScreenObjects.currentRoom.roomDoorId, roomScreenObjects.notesTextArea.value);
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

    switch(id) {
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
            break;
    }
}
