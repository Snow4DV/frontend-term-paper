let mainInit = function() {
    const findRoom = document.getElementById('find-room');
    findRoom.addEventListener('input', function() {findRoom.setAttribute('value', findRoom.value)});
    const inputDest = document.getElementById('dest-p');
    inputDest.addEventListener('input', function() {inputDest.setAttribute('value', inputDest.value)});
    const notesField = document.getElementById('room-screen-notes');
    notesField.addEventListener('input', function() {
        notesField.setAttribute('value', notesField.value);
    });

    const inputStart = document.getElementById('start-p');
    inputStart.addEventListener('input', function() {inputStart.setAttribute('value', inputStart.value)});
}
window.addEventListener('load', mainInit);