var saveNoteButton;
var notesField;
var currentRoom;
var roomTitle;

var backButton;

window.addEventListener("load", function() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    currentRoom = JSON.parse(params.room);


    backButton = document.getElementById("back-button");
    backButton.addEventListener("click", function() {
        window.close();
    })
    notesField = document.getElementById('room-screen-notes');
    notesField.addEventListener('input', function() {
        notesField.setAttribute('value', notesField.value);
    });
    roomTitle = this.document.getElementById("room-screen-name");

    saveNoteButton = this.document.getElementById("save-note-button");
    saveNoteButton.addEventListener("click", function() {
        localStorage.setItem(currentRoom.roomDoorId, notesField.value);
        window.close();
    });

    if(localStorage.getItem(currentRoom.roomDoorId)) {
        notesField.value = localStorage.getItem(currentRoom.roomDoorId);
    }



    if(notesField.value != "") {
        notesField.setAttribute("value", notesField.value);
    } else {
        notesField.removeAttribute("value");
    }

    roomTitle.innerHTML = "Заметка для " + currentRoom.roomName;
    
    
});

