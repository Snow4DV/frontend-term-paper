let mainInit = function() {
    const inputStart = document.getElementById('start-p');
    inputStart.addEventListener('input', function() {inputStart.setAttribute('value', inputStart.value)});
    const inputDest = document.getElementById('dest-p');
    inputDest.addEventListener('input', function() {inputDest.setAttribute('value', inputDest.value)});
}
window.addEventListener('load', mainInit);