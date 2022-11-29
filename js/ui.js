

let uiInit = function() {
    
}
window.addEventListener("load", uiInit);

var autocomplete = function(input, roomsArray) {
    var currentFocus;
    input.addEventListener("input", function(e) {
        closeAllListsButPassed();

        var newDiv, titleDiv, currentValue = this.value;

        if (!currentValue) {
             return false;
        }

        currentFocus = -1; // nothing is selected by default
        newDiv = document.createElement("DIV");
        newDiv.setAttribute("id", this.id + "autocomplete-list");
        newDiv.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(newDiv);
        for (let i = 0; i < roomsArray.length; i++) {
            console.log("Comp with "  + roomsArray[i].roomName.substr(0, currentValue.length).toUpperCase()  + ", res is " + (roomsArray[i].roomName.substr(0, currentValue.length).toUpperCase() == currentValue.toUpperCase() ? "TRUE" : "FALSE")) ;
          if (roomsArray[i].roomName.substr(0, currentValue.length).toUpperCase() == currentValue.toUpperCase()) {
            titleDiv = document.createElement("DIV");
            titleDiv.innerHTML = "<strong>" + roomsArray[i].roomName.substr(0, currentValue.length) + "</strong>";
            titleDiv.innerHTML += roomsArray[i].roomName.substr(currentValue.length);
            titleDiv.innerHTML += "<input type='hidden' value='" + roomsArray[i].roomName + "'>";
                titleDiv.addEventListener("click", function(e) {
                    //roomsArray.value = this.getElementsByTagName("input")[0].value;
                    closeAllListsButPassed();
                    let selected = e.path[0].childNodes[0].innerHTML + (e.path[0].childNodes[1].nodeValue == null ? "" : e.path[0].childNodes[1].nodeValue);
                    input.value = selected;
                    
                    
            });
            newDiv.appendChild(titleDiv);
          }
        }
    });
    input.addEventListener("keydown", function(e) {
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