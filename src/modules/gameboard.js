import Ship from "./ship.js";

export default function Gameboard(size=10) {
    const GAMEBOARD_SIZE = size;
    const SHIP_INFO = [[5, "carrier"], [4, "battleship"], [3, "cruiser"], [3, "submarine"], [2, "destroyer"]];

    const grid = new Array(GAMEBOARD_SIZE);
    const shipsPlaced = new Set();
    const attackedCells = new Map();

    let currentOrientation = "H";

    function initializeBoard() {
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(grid.length);
            for (let j = 0; j < grid[i].length; j++)
                grid[i][j] = undefined;
        }    
    }

    function getBoardSize() {
        return GAMEBOARD_SIZE;
    }

    function getShipInfo() {
        return [...SHIP_INFO];
    }

    function getCellItem(cell) {
        return grid[cell[0]][cell[1]];
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
            throw new Error("The ship can't be placed at this location! Please select a valid location.");

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
            const endCol = startCol+shipLength-1;
            if (isCellValid([startRow, endCol]) === false)
                return false;

            for (let i = startCol; i < (startCol+shipLength); i++) {
                if (grid[startRow][i] instanceof Ship)
                    return false;
                cells.push([startRow, i]);
            }
        }
        else if (orientation === "V") {
            const endRow = startRow+shipLength-1;
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

    function getCurrentOrientation() {
        return currentOrientation;
    }

    function setOrientation(orient) {
        if (orient !== "H" && orient !== "V")
            throw new Error("Invalid orientation");

        currentOrientation = orient;
    }

    function isThisShipPlaced(shipIndex) {
        return shipsPlaced.has(shipIndex);
    }

    function areShipsPlaced() {
        return !(shipsPlaced.size < SHIP_INFO.length);
    }

    function resetShipPlacement() {
        initializeBoard();
        shipsPlaced.clear();
    }

    function receiveAttack(cell) {
        if (isCellValid(cell) === false)
            throw new Error("Invalid cell!");

        const row = cell[0];
        const col = cell[1];
        if (attackedCells.has(`${row}, ${col}`))
            throw Error ("Already hit! Choose another cell!");

        if (grid[row][col] instanceof Ship) {
            const ship = grid[row][col];
            ship.hit();

            attackedCells.set(`${row}, ${col}`, "hit");
        }
        else
            attackedCells.set(`${row}, ${col}`, "miss");
    }

    function getAttackedCells() {
        return attackedCells;
    }

    // for AI player
    function placeShipsRandomly() {
        let currentShipIndex = 0;
        while (areShipsPlaced() === false) {
            const row = Math.floor(Math.random()*10);
            const col = Math.floor(Math.random()*10);
            const cell = [row, col];
            const orientation = (Math.floor(Math.random()*2) === 0) ? "H" : "V";

            try {
                placeShip(cell, orientation, currentShipIndex);
                currentShipIndex++;
            }
            catch {
                continue;
            }
        }
    }

    initializeBoard();
    return {getBoardSize, getShipInfo, getCellItem, placeShip, getCellsForPlacement, 
        getCurrentOrientation, setOrientation, isThisShipPlaced, areShipsPlaced, resetShipPlacement, 
        receiveAttack, getAttackedCells, placeShipsRandomly};
}