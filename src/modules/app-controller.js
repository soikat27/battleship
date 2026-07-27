import Gameboard from "./gameboard.js";
import Player from "./player.js";

const AppController = (() => {
    const players = new Array(2);
    let currentTurn = 0;

    function setupPlayers(p1Name, p2Name=undefined) {
        // player-1
        const player1Board = Gameboard();
        const player1 = new Player("Human", player1Board, p1Name);
        players[0] = player1;

        // player-2
        const player2Board = Gameboard();
        const player2Name = (p2Name === undefined) ? "Computer" : p2Name;
        const player2Type = (p2Name === undefined) ? "AI" : "Human";
        const player2 = new Player(player2Type, player2Board, player2Name);
        players[1] = player2;
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

    function attackCell(cell) {
        // 1. throw error if all ships haven't been placed (both player's and opponent's)
        if (isReadyToBattle() === false)
            throw new Error("Please place all of your ships and wait for opponent's ships to be placed before proceeding!");

        // 2. call receive-attack in curernt opponent's gameboard + update current turn
        const atatckedPlayer = (currentTurn === 0) ? 1 : 0;
        const attackedBoard = players[atatckedPlayer].gameboard;
        attackedBoard.receiveAttack(cell);
        currentTurn = (currentTurn === 0) ? 1 : 0;
    }

    return {setupPlayers, getMyBoard, placeOpponentShips, getOpponentHitMap, isReadyToBattle, attackCell};
})();

export default AppController;