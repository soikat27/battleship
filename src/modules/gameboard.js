import Ship from "./ship.js";

export default function Gameboard() {
    const SHIP_INFO = [[5, "carrier"], [4, "battleship"], [3, "cruiser"], [3, "submarine"], [2, "destroyer"]];
    const grid = new Array(10);
    // const ships = new Array(5);
    // let shipsPlaced = 0;
    const shipsPlaced = new Set();
    const attackedCells = new Set();
    let sunkShips = 0;

    function initializeBoard() {
        // setup grid
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(10);
        }

        // build ships
        // for (let i = 0; i < ships.length; i++) {
        //     ships[i] = new Ship(SHIP_INFO[i][0]);
        // }
    }

    function placeShip(startCell, orientation, shipIndex) {
        // 1. validate ship 
        if (shipsPlaced.size >= SHIP_INFO.length)
            throw new Error("All ships have been placed!");
        if (shipIndex < 0 || shipIndex >= SHIP_INFO.length)
            throw new Error("No such ship!");
        if (shipsPlaced.has(shipIndex))
            throw new Error("This ship has already been placed!");
        
        const cells = getCellsForPlacement(startCell, orientation, shipIndex);
        if (cells === false)
            throw new Error("The ship can't be placed!");

        // 2. place ship
        const ship = new Ship(SHIP_INFO[shipIndex][0]);
        cells.forEach(cell => {
            const row = cell[0];
            const col = cell[1];
            grid[row][col] = ship;
        });
        shipsPlaced.add(shipIndex);
    }

    function getCellsForPlacement(startCell, orientation, shipIndex) {
        if (isCellValid(startCell) === false)
            return false;

        const startRow = startCell[0];
        const startCol = startCell[1];
        const shipLength = SHIP_INFO[shipIndex][0];
        const cells = [];

        if (orientation === "H") {
            const endCol = startCol+shipLength;
            if (isCellValid([startRow, endCol]) === false)
                return false;

            for (let i = startCol; i < (startCol+shipLength); i++) {
                if (grid[startRow][i] instanceof Ship)
                    return false;
                cells.push([startRow, i]);
            }
        }
        else if (orientation === "V") {
            const endRow = startRow+shipLength;
            if (isCellValid([endRow, startCol]) === false)
                return false;

            for (let i = startRow; i < (startRow+shipLength); i++) {
                if (grid[i][startCol] instanceof Ship)
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

    function receiveAttack(cell) {
        if (sunkShips >= shipsPlaced)
            throw new Error("All ships have been sunk!");
        const row = cell[0];
        const col = cell[1];

        if (grid[row][col] === undefined) {
            grid[row][col] = "miss";
            return;
        }
        if (attackedCells.has(`${row}, ${col}`))
            throw Error ("Already hit! Choose another cell!");

        const ship = grid[row][col];
        ship.hit();

        if (ship._isSunk === true)
            sunkShips++; 
    }

    initializeBoard();

    return {placeShip, getCellItem, receiveAttack, grid};
}