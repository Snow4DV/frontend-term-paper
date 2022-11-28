// Main js script
let floors = ["floor0", "floor1", "floor2", "floor3", "floor4"];


var setVisibleFloor = function(floorId) {
    for(let i = 0; i < floors.length; i++) {
        let floorContainer = document.getElementById(floors[i] + "-container");
        if(floors[i] != floorId) {
            floorContainer.setAttribute("hidden", "");
        } else {
            floorContainer.removeAttribute("hidden");
        }
    }
}

