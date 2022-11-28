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



var predefinePortalWays = function(floorId) {
    for(let i = 0; i < floors.length; i++) {
        let floorContainer = document.getElementById((floorId == null) ? floors[i] : floorId + "-container");
        let portals = floorContainer.querySelectorAll("#Portals>*");
        for(let j = 0; j < portals.length; j++) {
            let splitPortalId = portals[j].id.split(".");
            let portalWays = portals[j].getAttribute("ways");
            console.log("----------SEARCHING FOR WAYS-----------");
            console.log("Portal:");
            console.log(portals[j]);
            for(let k = 0; k < floors.length; k++) {
                if(k == i) continue;
                let checkFloorContainer = document.getElementById(floors[k] + "-container");
                let portalOnAnotherFloor = checkFloorContainer. querySelector("#Portals>#" + splitPortalId[0] + "\\." + splitPortalId[1] + "\\." + floors[k]);

                if(portalOnAnotherFloor != null) {
                    portalWays += "," + splitPortalId[0] + "\\." + splitPortalId[1] + "\\." + floors[k];
                    console.log("Connected to:");
                    console.log(portalOnAnotherFloor);
                }
            }

            portals[j].setAttribute("ways", portalWays);
            
        }
        if(floorId != null) {
            return;
        }
    }
}

