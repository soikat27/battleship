import Ship from "./ship.js";

export default function gameboard() {
    const grid = new Array(10);
    const ships = new Array(5);

    function initializeBoard() {
        // setup grid
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(10);
        }

        // build ships
        const shipSizes = [5, 4, 3, 3, 2];
        for (let i = 0; i < ships.length; i++) {
            ships[i] = new Ship(shipSizes[i]);
        }
    }

    function placeShip(startCell, shipName) {

    }

    return {initializeBoard};
}