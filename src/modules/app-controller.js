import Gameboard from "./gameboard.js";
import Player from "./player.js";

const AppController = (() => {
    const players = new Array(2);
    const currentMove = 0;

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
        if (!players[0])
            throw new Error("Please setup players first!");
            
        return players[0].gameboard;
    }

    function makeMove(cell) {
        // 1. throw error if all ships haven't been placed
        const currPlayerBoard = players[currentMove].gameboard;
        if (!currPlayerBoard.areShipsPlaced())
            throw new Error("Please place all of your ships to proceed!");

        const enemy = (currentMove === 0) ? 1 : 0;
        // const enemyBoard = 
    }

    return {setupPlayers, getMyBoard, makeMove};
})();

export default AppController;