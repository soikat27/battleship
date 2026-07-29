import AppController from "./app-controller.js";
import Ship from "./ship.js";
import inGameMusicFile from "../assets/sounds/game-music.mp3";
import fireSoundFile from "../assets/sounds/fire.mp3";
import victorySoundFile from "../assets/sounds/victory.mp3";
import lossSoundFile from "../assets/sounds/loss.wav";

function UIController() {
    const gameMusic = new Audio(inGameMusicFile);
    const fireAudio = new Audio(fireSoundFile);
    const victoryAudio = new Audio(victorySoundFile);
    const lossAudio = new Audio(lossSoundFile);

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

        // 2. play music --> setup game in AppController module
        playGameMusic();
        let p1Name = playerNameInput.value;
        AppController.setupPlayers(p1Name);

        // 3. engrave player name --> render grid + ship dragbox
        const captainName = document.querySelector(".player-name")
        captainName.textContent = AppController.getCaptainName();
        renderShipPage();

        // 4. show ShipPage (toggle "hidden" class)
        document.querySelector("section.name-page").hidden = true;
        document.querySelector("section.battle-page").hidden = true;
        document.querySelector("section.ship-page").hidden = false;
    }

    function playGameMusic() {
        // setup and play game music
        gameMusic.currentTime = 0;
        gameMusic.volume = 0.3;
        gameMusic.loop = true;
        gameMusic.play();
    }

    function renderGrid(gridContainer, pageName, isEnemyWaters) {
        // 0. clear grid
        gridContainer.innerHTML = "";

        // 1. add a empty corner
        const gridCorner = document.createElement("div");
        gridCorner.classList.add(`${pageName}-page_grid-corner`);
        gridContainer.appendChild(gridCorner);

        // 2. add col label
        const gridSize = AppController.getMyBoard().getBoardSize();
        const unicode_A = "A".charCodeAt(0);
        for (let i = 0; i < gridSize; i++) {
            const gridLabel = document.createElement("div");
            gridLabel.classList.add(`${pageName}-page_grid-label`, `${pageName}-page_grid-label-col`);
            gridLabel.textContent = String.fromCharCode(unicode_A+i);

            gridContainer.appendChild(gridLabel);
        }

        // 3. add row labels
        //  3a. for each add grid cells
        for (let rowLabel = 1; rowLabel <= gridSize; rowLabel++) {
            const label = document.createElement("div");
            label.classList.add(`${pageName}-page_grid-label`, `${pageName}-page_grid-label-row`);
            label.textContent = rowLabel;
            gridContainer.appendChild(label);
            const row = rowLabel-1;

            for (let col = 0; col < gridSize; col++) {
                const cell = document.createElement("div");
                cell.classList.add(`${pageName}-page_cell`);

                // class: is-ship + handling
                if (isEnemyWaters === false && AppController.getMyBoard().getCellItem([row, col]) instanceof Ship)
                    cell.classList.add("is-ship");

                // appropriate map for board type – friendly or enemy
                let attackedCells;
                if (isEnemyWaters === false)
                    attackedCells = AppController.getMyBoard().getAttackedCells();
                else
                    attackedCells = AppController.getOpponentHitMap();

                // if battle-page: is-hit/is-miss handling
                if (pageName === "battle" && attackedCells.has(`${row}, ${col}`)) {
                    const status = attackedCells.get(`${row}, ${col}`);
                    const className = `is-${status}`;
                    cell.classList.add(className);
                }
                cell.dataset.row = row;
                cell.dataset.col = col;

                gridContainer.appendChild(cell);
            }
        }
    }

    function renderFleet() {
        const fleetDiv = document.querySelector(".ship-page_fleet");

        // 0. clear fleet
        fleetDiv.innerHTML = "";

        // 1. add fleet
        const shipInfo = AppController.getMyBoard().getShipInfo();
        for (let i = 0; i < shipInfo.length; i++) {
            const html = `<li class="ship-page_fleet-item${(AppController.getMyBoard().isThisShipPlaced(i)) ? " is-placed": ""}" draggable="true" data-ship-index="${i}" data-ship-length="${shipInfo[i][0]}">
                            <svg class="ship-page_fleet-icon" viewBox="0 0 48 20" aria-hidden="true" focusable="false">
                                <path fill="currentColor" d="M2 12h40l-2 5H4zm6-2 3-6h4l2 6zm10 0 4-8h8l3 8zm14 0 2-4h5l2 4z"/>
                            </svg>
                            <span class="ship-page_fleet-len">${shipInfo[i][0]}</span>
                            <span class="ship-page_fleet-name">${shipInfo[i][1]}</span>
                        </li>`;
            
            fleetDiv.insertAdjacentHTML("beforeend", html);
        }  
    }

    function renderShipPage() {
        const gridContainer = document.querySelector(".ship-page_grid");
        renderGrid(gridContainer, "ship", false);
        renderFleet();

        // enable start-battle button if all ships are placed
        const battleBtn = document.querySelector(".ship-page_battle");
        battleBtn.disabled = !(AppController.getMyBoard().areShipsPlaced());
    }

    function validatePlayerName(input) {
        // 1. clear custom validity
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

    function shipDragstartListener(event) {
        // 1. check if the event is fired from a fleet item
        if (event.target instanceof Element === false)
            return;
        
        const fleetItem = event.target.closest(".ship-page_fleet-item");
        if (!fleetItem)
            return;

        // 2. add shipInfo – ex. ship-index in dataTransfer
        const shipIndex = fleetItem.dataset.shipIndex;
        event.dataTransfer.setData("ship-index", shipIndex);

        // 3. set drag image: get orient & length -> toggle "is-vertical" -> add ghost-cell and attach to dragImage
        const orient = AppController.getMyBoard().getCurrentOrientation();
        const shipLength = Number(fleetItem.dataset.shipLength);
        const shipGhostDiv = document.querySelector(".ship-ghost");
        shipGhostDiv.innerHTML = "";
        if (orient === "V")
            shipGhostDiv.classList.add("is-vertical");
        else
            shipGhostDiv.classList.remove("is-vertical");

        for (let i = 0; i < shipLength; i++) {
            const ghostCell = document.createElement("div");
            ghostCell.classList.add("ship-ghost_cell");
            shipGhostDiv.appendChild(ghostCell);
        }
        event.dataTransfer.setDragImage(shipGhostDiv, 28, 28);
    }

    function shipDragoverListener(event) {
        // 1. confirm if the event's fired from a grid cell
        const cell = event.target.closest(".ship-page_cell");
        if (!cell)
            return;

        // 2. prevent default – allows drop
        event.preventDefault();        
    }

    function shipDropListener(event) {
        // 1. confirm if the event fired from a grid cell
        const cell = event.target.closest(".ship-page_cell");
        if (!cell)
            return;
        
        // 2. get cell row/col from dataset for placement.
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const myBoard = AppController.getMyBoard();
        const shipIndex = Number(event.dataTransfer.getData("ship-index"));
        const orientation = myBoard.getCurrentOrientation();

        // 3. add ship -> in the event of error: display toast -> finally re-render shipPage
        try {
            myBoard.placeShip([row, col], orientation, shipIndex);
        } 
        catch(error) {
            const errorMsg = error.message;
            const shipToast = document.querySelector(".ship-page_toast");
            shipToast.textContent = errorMsg;
            shipToast.hidden = false;

            setTimeout(() => {
                shipToast.hidden = true;
                shipToast.textContent = "";
            }, 800);
        }
        finally {
            renderShipPage();
        }
    }

    function resetShipPlacement() {
        // 1. call ship-reset from AppController module
        AppController.getMyBoard().resetShipPlacement();

        // 2. re-render ship page
        renderShipPage();
    }

    function goToBattlePage(event) {
        // 1. prevent default behavior
        event.preventDefault();

        // 2. place opponent's ships randomly
        AppController.placeOpponentShips();

        // 3. check if all ships are placed –> on success: go to battle-page or return without actions
        if (AppController.isReadyToBattle() === false)
            return;

        // 4. render
        renderBattlePage();

        // 5. show ShipPage (toggle "hidden" class)
        document.querySelector("section.name-page").hidden = true;
        document.querySelector("section.ship-page").hidden = true;
        document.querySelector("section.battle-page").hidden = false;

    }

    function renderBattlePage() {
        // 1. render friendly waters
        const friendlyWaters = document.querySelector(".battle-page_grid[data-board=friendly]");
        renderGrid(friendlyWaters, "battle", false);
        showSunkShips(friendlyWaters, 0);

        // 2. render enemy waters
        const enemyWaters = document.querySelector(".battle-page_grid[data-board=enemy]");
        renderGrid(enemyWaters, "battle", true);
        showSunkShips(enemyWaters, 1)

        // 3. update whose turn
        const turnLabel = document.querySelector(".battle-page_turn");
        turnLabel.textContent = (AppController.getCurrentTurn() === 0) ? "Your turn" : "Computer's turn";
    }

    function showSunkShips(gridContainer, playerIndex) {
        const sunkShipCells = AppController.getSunkShipCells(playerIndex);

        sunkShipCells.forEach(cell => {
            const gridCell = gridContainer.querySelector(`[data-row="${cell[0]}"][data-col="${cell[1]}"]`);
            gridCell.classList.add("is-ship-sunk");
        });
    }

    function attackCell (event) {
        // 1. check if the event is fired from a grid-cell and has no is-hit or is-miss
        const cell = event.target.closest(".battle-page_cell");
        if (!cell)
            return;

        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const isAttacked = (AppController.getOpponentHitMap().has(`${row}, ${col}`));
        if (isAttacked)
            return;

        // 2. attack cell (my turn) & play fireSound + render page and following that simulate computer attack
        const enemyWaters = document.querySelector(".battle-page_grid[data-board=enemy]");
        if (AppController.getCurrentTurn() === 0) {
            AppController.attackCell([Number(row), Number(col)]);
            playFireSound();

            enemyWaters.classList.add("is-locked");
            setTimeout(() => {
                renderBattlePage();
                // check if game is over
                if (AppController.isGameOver()) {
                    showGameOverDialog();
                    return;
                }
                
                if (AppController.getCurrentTurn() === 0) {
                    enemyWaters.classList.remove("is-locked");
                    return;
                }
                else {
                    setTimeout(() => {
                        computerMove();
                    }, 1500);
                }
            }, 500);
        }
    }

    function playFireSound() {
        fireAudio.currentTime = 0;
        fireAudio.volume = 0.1;
        fireAudio.play();
    }

    function computerMove() {
        AppController.simulateComputerMove();
        playFireSound();
        renderBattlePage();
        // check if game is over
        if (AppController.isGameOver()) {
            showGameOverDialog();
            return;
        }     

        if (AppController.getCurrentTurn() === 0) {
            const enemyWaters = document.querySelector(".battle-page_grid[data-board=enemy]");
            enemyWaters.classList.remove("is-locked");
            return;
        }
        else {
            setTimeout(() => {
                computerMove();
            }, 1000);
        }
    }

    function showGameOverDialog() {
        const dialog = document.querySelector(".battle-page_end");
        const dialogTitle = document.querySelector(".battle-page_end-title");
        const dialogMsg = document.querySelector(".battle-page_end-message");

        if (AppController.getWinner() === "Computer") {
            dialogTitle.textContent = "Fleet Lost, Captain!";
            dialogMsg.textContent = "The enemy holds the waters. Refit and sail again.";
            playLossSound();
        }
            
        else {
            dialogTitle.textContent = `Victory, Captain ${AppController.getCaptainName()}!`;
            dialogMsg.textContent = "Enemy waters are clear and the sea is conquered.";
            playVictorySound();
        }

        dialog.showModal();
    }

    function playVictorySound() {
        // pause in-game music
        gameMusic.pause();
        gameMusic.currentTime = 0;

        victoryAudio.currentTime = 0;
        victoryAudio.volume = 0.5;
        victoryAudio.play();
    }

    function playLossSound() {
        // pause in-game music
        gameMusic.pause();
        gameMusic.currentTime = 0;

        lossAudio.currentTime = 0;
        lossAudio.volume = 0.5;
        lossAudio.play();
    }

    function restartGame() {
        AppController.resetGame();

        // go back to name-page
        document.querySelector("section.ship-page").hidden = true;
        document.querySelector("section.battle-page").hidden = true;
        document.querySelector("section.name-page").hidden = false;

        const dialog = document.querySelector(".battle-page_end");
        dialog.close();
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

        // ship drag and drop
        const fleetDiv = document.querySelector(".ship-page_fleet");
        fleetDiv.addEventListener("dragstart", shipDragstartListener);

        const shipGrid = document.querySelector(".ship-page_grid");
        shipGrid.addEventListener("dragover", shipDragoverListener);
        shipGrid.addEventListener("drop", shipDropListener);

        // reset ship placements btn
        const resetShipBtn = document.querySelector(".ship-page_reset");
        resetShipBtn.addEventListener("click", resetShipPlacement);

        // start battle btn
        const battleBtn = document.querySelector(".ship-page_battle");
        battleBtn.addEventListener("click", goToBattlePage);

        // hit cells in enemy water
        const enemyWaters = document.querySelector(".battle-page_grid[data-board=enemy]");
        enemyWaters.addEventListener("click", attackCell);

        // new battle button
        const newBattleBtn = document.querySelector(".battle-page_end-btn");
        newBattleBtn.addEventListener("click", restartGame);
    }

    function initializeApp() {
        setEventListeners();
    }

    return {initializeApp};
}

export default UIController;