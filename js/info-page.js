var backButton;

window.addEventListener("load", function() {
    backButton = document.getElementById("back-button");
    backButton.addEventListener("click", function() {
        history.back();
    });
});

