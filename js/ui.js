


var autocomplete = function (input, roomsArray) {
  var currentFocus;
  input.addEventListener("input", function (e) {
    closeAllListsButPassed();

    var newDiv, titleDiv, currentValue = this.value;

    if (!currentValue) {
      return false;
    }

    currentFocus = -1; // nothing is selected by default
    newDiv = document.createElement("DIV");
    newDiv.setAttribute("id", this.id + "autocomplete-list");
    newDiv.setAttribute("class", "autocomplete-items");
    this.parentNode.parentNode.appendChild(newDiv);
    for (let i = 0; i < roomsArray.length; i++) {
      if (roomsArray[i].roomName.substr(0, currentValue.length).toUpperCase() == currentValue.toUpperCase()) {
        titleDiv = document.createElement("DIV");
        titleDiv.innerHTML = "<strong>" + roomsArray[i].roomName.substr(0, currentValue.length) + "</strong>";
        titleDiv.innerHTML += roomsArray[i].roomName.substr(currentValue.length);
        titleDiv.innerHTML += "<input type='hidden' value='" + roomsArray[i].roomName + "'>";
        titleDiv.addEventListener("click", function (e) {
          //roomsArray.value = this.getElementsByTagName("input")[0].value;
          closeAllListsButPassed();
          let selected = e.path[0].childNodes[0].innerHTML + (e.path[0].childNodes[1] && e.path[0].childNodes[1].nodeValue == null ? "" : e.path[0].childNodes[1].nodeValue);
          input.value = selected;
          input.setAttribute("value", selected);
          openWindow("room-screen",getRoomByName(input.value));

        });
        newDiv.appendChild(titleDiv);
      }
    }
  });
  input.addEventListener("keydown", function (e) {
    var currentElement = document.getElementById(this.id + "autocomplete-list");
    if (currentElement) currentElement = currentElement.getElementsByTagName("div");
    if (e.keyCode == 40) { // down arrow key
      currentFocus++;
      addActiveElement(currentElement);
    } else if (e.keyCode == 38) { // up arrow key
      currentFocus--;
      addActiveElement(currentElement);
    } else if (e.keyCode == 13) {
      if (currentFocus > -1) {
        if (currentElement) currentElement[currentFocus].click();
      }
    }
  });
  function removeActiveElement(element) {
    for (var i = 0; i < element.length; i++) {
      element[i].classList.remove("autocomplete-active");
    }
  }
  function addActiveElement(element) {
    if (!element) return false;
    removeActiveElement(element);
    if (currentFocus >= element.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (element.length - 1);
    element[currentFocus].classList.add("autocomplete-active");
  }

  function closeAllListsButPassed(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != input) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllListsButPassed(e.target);
  });
}

function getRoomByName(name) {
  let rooms = FloorMap.getRooms();

  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].roomName == name) {
      return rooms[i];
    }
  }
}


let uiInit = function () {
  autocomplete(document.getElementById("dest-p"), FloorMap.getRooms());
  autocomplete(document.getElementById("start-p"), FloorMap.getRooms());
  autocomplete(document.getElementById("find-room"), FloorMap.getRooms());

  let findPathButton = document.getElementById("build-route-button");
  findPathButton.addEventListener("click", function () {

    let startName = document.getElementById("start-p").value, endName = document.getElementById("dest-p").value;
    let rooms = FloorMap.getRooms();

    let startId, endId;

    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].roomName == startName) {
        startId = rooms[i].roomDoorId;
      }
      if (rooms[i].roomName == endName) {
        endId = rooms[i].roomDoorId;
      }
    }

    if (startId != null && endId != null) {
      let searchResult = WayFinder.findPath(startId, endId);
      openWindow("route-screen", {from: startName, to: endName, distance: (searchResult.distance/7.2) | 0});
    }

  });
  
}
window.addEventListener("load", uiInit);


function openRoom(roomName) {

}


