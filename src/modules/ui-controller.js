import AppController from "./app-controller.js";

function UIController() {
    function goToShipPage(event) {
        // 1. prevent default behavior + validate and report inputs
        event.preventDefault();
        const playerNameInput = document.getElementById("player-name");
        validatePlayerName(playerNameInput);

        const namePageForm = event.target;
        if (!namePageForm.checkValidity()) {
            namePageForm.reportValidity();
            return;
        }

        // 2. setup game in AppController module
        let p1Name = playerNameInput.value.trim();
        p1Name = p1Name.slice(0, 1).toUpperCase() + p1Name.slice(1);
        AppController.setupPlayers(p1Name);

        // 3. render grid + ship dragbox
        renderGrid();

        // 4. show ShipPage (toggle "hidden" class)
        document.querySelector("section.name-page").hidden = true;
        document.querySelector("section.battle-page").hidden = true;
        document.querySelector("section.ship-page").hidden = false;
    }

    function renderGrid() {
        const gridContainer = document.querySelector(".ship-page_grid");

        // 1. add a empty corner
        const gridCorner = document.createElement("div");
        gridCorner.classList.add("ship-page_grid-corner");
        gridContainer.appendChild(gridCorner);

        // 2. add col label
        const gridSize = AppController.getMyBoard().getBoardSize();
        const unicode_A = "A".charCodeAt(0);
        for (let i = 0; i < gridSize; i++) {
            const gridLabel = document.createElement("div");
            gridLabel.classList.add("ship-page_grid-label", "ship-page_grid-label-col");
            gridLabel.textContent = String.fromCharCode(unicode_A+i);

            gridContainer.appendChild(gridLabel);
        }

        // 3. add row labels
        //  3.a for each add grid cells
        for (let rowLabel = 1; rowLabel <= gridSize; rowLabel++) {
            const label = document.createElement("div");
            label.classList.add("ship-page_grid-label", "ship-page_grid-label-row");
            label.textContent = rowLabel;
            gridContainer.appendChild(label);

            for (let cellCol = 0; cellCol < gridSize; cellCol++) {
                const cell = document.createElement("div");
                cell.classList.add("ship-page_cell");
                cell.dataset.row = rowLabel;
                cell.dataset.col = cellCol;
                gridContainer.appendChild(cell);
            }
        }
    }

    function validatePlayerName(input) {
        // 1. clear custom validity
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

    function setOrient(event) {
        // 1. determine current target's closest is H or V button
        if (!event.target.closest(".ship-page_orient-btn"))
            return;
        const orient = event.target.dataset.orientation;

        // 2. call setOrient from myBoard
        const myBoard = AppController.getMyBoard();
        const currentOrient = myBoard.getCurrentOrientation();
        if (orient === currentOrient)
            return;

        myBoard.setOrientation(orient);

        // 3. update classList
        const newOrient = myBoard.getCurrentOrientation();
        if (newOrient === "H") {
            document.querySelector('.ship-page_orient-btn[data-orientation="H"]').classList.add("is-active");
            document.querySelector('.ship-page_orient-btn[data-orientation="V"]').classList.remove("is-active");
        }    
        else {
            document.querySelector('.ship-page_orient-btn[data-orientation="V"]').classList.add("is-active");
            document.querySelector('.ship-page_orient-btn[data-orientation="H"]').classList.remove("is-active");
        }
    }

    function setEventListeners() {
        // name-page form
        const namePageForm = document.querySelector(".name-page_form");
        namePageForm.addEventListener("submit", goToShipPage);

        // player name input validation
        const playerNameInput = document.getElementById("player-name");
        playerNameInput.addEventListener("input", () => {
            const playerNameInput = document.getElementById("player-name");
            validatePlayerName(playerNameInput);
        });

        // orient button toggle
        const orientBtnsDiv = document.querySelector(".ship-page_orient");
        orientBtnsDiv.addEventListener("click", setOrient);
    }

    function initializeApp() {
        setEventListeners();
    }

    return {initializeApp};
}

export default UIController;

