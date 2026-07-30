import Gameboard from "./gameboard.js";
import Player from "./player.js";

/**
 * AppController — wires players, turns, attacks, and the computer move.
 * UI talks to this module instead of touching boards directly for game flow.
 */
const AppController = (() => {
    let players = new Array(2);
    let currentTurn = 0;
    let captainName = null;

    /**
     * Builds both players and their boards.
     * Defaults player 2 to an AI "Computer" when no second name is passed.
     * @param {string} p1Name - captain name
     * @param {string} [p2Name] - optional second human name
     */
    function setupPlayers(p1Name, p2Name=undefined) {
        // setup captain's name
        captainName = p1Name.trim();
        captainName = p1Name.slice(0, 1).toUpperCase() + p1Name.slice(1);

        // player-1/captain
        const player1Board = Gameboard();
        const player1 = new Player("Human", player1Board, captainName);
        players[0] = player1;

        // player-2
        const player2Board = Gameboard();
        const player2Name = (p2Name === undefined) ? "Computer" : p2Name;
        const player2Type = (p2Name === undefined) ? "AI" : "Human";
        const player2 = new Player(player2Type, player2Board, player2Name);
        players[1] = player2; 
    }

    /**
     * @returns {string} display name for the captain
     * @throws {Error} if setupPlayers hasn't run yet
     */
    function getCaptainName() {
        if (players[0] === undefined)
            throw new Error("Setup players first!");

        return captainName;
    }

    /** @returns {object} the human player's gameboard */
    function getMyBoard() { 
        return players[0].gameboard;
    }

    /** Randomly places the opponent fleet (AI board). */
    function placeOpponentShips() {
        const opponentBoard = players[1].gameboard;
        opponentBoard.placeShipsRandomly();
    }

    /**
     * Hit/miss map for the enemy board (fog of war rendering).
     * @returns {Map<string, string>}
     */
    function getOpponentHitMap() {
        return players[1].gameboard.getAttackedCells();
    }

    /**
     * Both fleets must be placed before battle can start.
     * @returns {boolean}
     */
    function isReadyToBattle() {
        const playerBoard = players[0].gameboard;
        const opponentBoard = players[1].gameboard;
        
        if (!playerBoard.areShipsPlaced() || !opponentBoard.areShipsPlaced())
            return false;

        return true;
    }

    /**
     * Whose turn it is.
     * @returns {0|1} 0 = human, 1 = computer
     */
    function getCurrentTurn() {
        return currentTurn;
    }

    /**
     * Fires at a cell on the current opponent's board.
     * Human shots use receiveAttack; computer shots use receiveAttackAI.
     * Turn only switches on a miss.
     * @param {[number, number]} cell - [row, col]
     * @throws {Error} if fleets aren't ready yet
     */
    function attackCell(cell) {
        // 1. throw error if all ships haven't been placed (both player's and opponent's)
        if (isReadyToBattle() === false)
            throw new Error("Please place all of your ships and wait for opponent's ships to be placed before proceeding!");

        // 2. call receive-attack in curernt opponent's gameboard + update current turn
        const atatckedPlayer = (currentTurn === 0) ? 1 : 0;
        const attackedBoard = players[atatckedPlayer].gameboard;
        if (atatckedPlayer === 0) {
            if (attackedBoard.receiveAttackAI(cell) === false)
                currentTurn = (currentTurn === 0) ? 1 : 0;
        }  
        else {
            if (attackedBoard.receiveAttack(cell) === false)
                currentTurn = (currentTurn === 0) ? 1 : 0;
        }
    }

    /**
     * Picks the computer's next shot — predictive queue if targeting,
     * otherwise a random unattacked cell — then attacks.
     */
    function simulateComputerMove() {
        if (currentTurn !== 1)
            return;

        const playerBoard = players[0].gameboard;
        let row;
        let col;
        const predictiveCells = playerBoard.predictAdjacentCells();
        
        if (predictiveCells === null) {
            row = Math.floor(Math.random()*10);
            col = Math.floor(Math.random()*10);
        }
        else {
            const cell = predictiveCells[0][0];
            row = cell[0];
            col = cell[1];
        }
        let cellKey = `${row}, ${col}`;

        const friendlyWatersAttackedCells = players[0].gameboard.getAttackedCells();
        while (friendlyWatersAttackedCells.has(cellKey)) {
            row = Math.floor(Math.random()*10);
            col = Math.floor(Math.random()*10);
            cellKey = `${row}, ${col}`;
        }
        const cell = [row, col];
        attackCell(cell);
    }

    /**
     * @param {0|1} playerIndex
     * @returns {number[]} sunk ship indexes for that player
     */
    function getSunkShips(playerIndex) {
        const playerBoard = players[playerIndex].gameboard;
        const sunkShips = playerBoard.getSunkShips();

        return sunkShips;
    }

    /**
     * All cells belonging to sunk ships (for is-ship-sunk styling).
     * @param {0|1} playerIndex
     * @returns {Array<[number, number]>}
     */
    function getSunkShipCells(playerIndex) {
        const sunkShips = getSunkShips(playerIndex);
        const cells = [];
        const playerBoard = players[playerIndex].gameboard;

        sunkShips.forEach(shipIndex => {
            const shipCells = playerBoard.getShipCells(shipIndex);
            cells.push(...shipCells);
        });
        return cells;
    }

    /** @returns {boolean} true if either fleet is fully sunk */
    function isGameOver() {
        const playerBoard = players[0].gameboard;
        const computerBoard = players[1].gameboard;

        return (playerBoard.isFleetSunk() || computerBoard.isFleetSunk());
    }

    /**
     * @returns {string|null} winner's name, or null if the game isn't over
     */
    function getWinner() {
        if (!isGameOver())
            return null;

        const playerBoard = players[0].gameboard;
        if (playerBoard.isFleetSunk())
            return players[1].name;
        else
            return players[0].name;
    }

    /** Clears players / turn / name so a new battle can start from scratch. */
    function resetGame() {
        players = new Array(2);
        currentTurn = 0;
        captainName = null;
    }

    return {setupPlayers, getCaptainName, getMyBoard, placeOpponentShips, getOpponentHitMap, 
        isReadyToBattle, attackCell, getCurrentTurn, simulateComputerMove, getSunkShips, 
        getSunkShipCells, isGameOver, getWinner, resetGame};
})();

export default AppController;
