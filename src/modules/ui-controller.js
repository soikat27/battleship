import AppController from "./app-controller.js";

function UIController() {

    function goToShipPage(event) {
        // 1. prevent default behavior + validate and report inputs

        // 2. 
    }

    function validatePlayerName(event) {
        // 1. clear custom validity
        const input = event.target;
        console.log(input.value);
        input.setCustomValidity("");

        // 2. on check, add "required" validity
        if (input.value.trim() === "")
            input.setCustomValidity("Still need your name, Captain!");

        // 3. on check, add "min-length" validity
        else if (input.value.trim().length > 20)
            input.setCustomValidity("Too long! got any nickname, Captain?");

        // 4. display validity
        input.reportValidity();
    }

    function setEventListeners() {
        // name-page form
        const namePageForm = document.querySelector(".name-page_form");
        namePageForm.addEventListener("submit", goToShipPage);

        // player name input validation
        const playerNameInput = document.getElementById("player-name");
        playerNameInput.addEventListener("input", validatePlayerName);
    }

    function initializeApp() {
        setEventListeners();
    }

    return {initializeApp};
}

export default UIController;

