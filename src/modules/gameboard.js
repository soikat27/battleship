import Ship from "./ship.js";

export default function Gameboard() {
    const SHIP_INFO = [[5, "carrier"], [4, "battleship"], [3, "cruiser"], [3, "submarine"], [2, "destroyer"]];
    const grid = new Array(10);
    const ships = new Array(5);
    let shipsPlaced = 0;

    function initializeBoard() {
        // setup grid
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(10);
        }

        // build ships
        for (let i = 0; i < ships.length; i++) {
            ships[i] = new Ship(SHIP_INFO[i][0]);
        }
    }

    function placeShip(startCell, orientation, shipIndex) {
        if (shipsPlaced >= ships.length)
            throw new Error("All ships have been placed!");
        if (shipIndex < 0 || shipIndex >= ships.length)
            throw new Error("No such ship!");
        
        const cells = getCellsForPlacement(startCell, orientation, shipIndex);
        if (cells === false)
            throw new Error("The ship can't be placed!");

        cells.forEach(cell => {
            const row = cell[0];
            const col = cell[1];
            grid[row][col] = ships[shipIndex];
        });

        shipsPlaced++;
    }

    function getCellsForPlacement(startCell, orientation, shipIndex) {
        if (isCellValid(startCell) === false)
            return false;

        const startRow = startCell[0];
        const startCol = startCell[1];
        const ship = ships[shipIndex];
        const cells = [];

        if (orientation === "H") {
            const endCol = startCol+ship.length;
            if (isCellValid([startRow, endCol]) === false)
                return false;

            for (let i = startCol; i < (startCol+ship.length); i++) {
                if (grid[startRow][i] !== undefined)
                    return false;
                cells.push([startRow, i]);
            }
        }
        else if (orientation === "V") {
            const endRow = startRow+ship.length;
            if (isCellValid([endRow, startCol]) === false)
                return false;

            for (let i = startRow; i < (startRow+ship.length); i++) {
                if (grid[i][startCol] !== undefined)
                    return false;
                cells.push([i, startCol]);
            }
        }

        return cells;
    }

    function isCellValid(cell) {
        const row = cell[0];
        const col = cell[1];

        if ((row < 0 || row >= 10) || (col < 0 || col >= 10))
            return false;

        return true;
    }

    function getCellItem(cell) {
        return grid[cell[0]][cell[1]];
    }

    initializeBoard();

    return {placeShip, getCellItem};
}