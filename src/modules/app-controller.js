import Gameboard from "./gameboard.js";
import Player from "./player.js";

const AppController = (() => {
    const players = new Array(2);
    let currentTurn = 0;
    let captainName = null;

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

    function getCaptainName() {
        if (players[0] === undefined)
            throw new Error("Setup players first!");

        return captainName;

    }

    function getMyBoard() { 
        return players[0].gameboard;
    }

    function placeOpponentShips() {
        const opponentBoard = players[1].gameboard;
        opponentBoard.placeShipsRandomly();
    }

    function getOpponentHitMap() {
        return players[1].gameboard.getAttackedCells();
    }

    function isReadyToBattle() {
        const playerBoard = players[0].gameboard;
        const opponentBoard = players[1].gameboard;
        
        if (!playerBoard.areShipsPlaced() || !opponentBoard.areShipsPlaced())
            return false;

        return true;
    }

    function getCurrentTurn() {
        return currentTurn;
    }

    function attackCell(cell) {
        // 1. throw error if all ships haven't been placed (both player's and opponent's)
        if (isReadyToBattle() === false)
            throw new Error("Please place all of your ships and wait for opponent's ships to be placed before proceeding!");

        // 2. call receive-attack in curernt opponent's gameboard + update current turn
        const atatckedPlayer = (currentTurn === 0) ? 1 : 0;
        const attackedBoard = players[atatckedPlayer].gameboard;
        if (attackedBoard.receiveAttack(cell) === false)
            currentTurn = (currentTurn === 0) ? 1 : 0;
    }

    function simulateComputerMove() {
        if (currentTurn !== 1)
            return;

        let row = Math.floor(Math.random()*10);
        let col = Math.floor(Math.random()*10);
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

    return {setupPlayers, getCaptainName, getMyBoard, placeOpponentShips, getOpponentHitMap, isReadyToBattle, 
        attackCell, getCurrentTurn, simulateComputerMove};
})();

export default AppController;