import Ship from "./ship.js";

export default function Gameboard(size=10) {
    const GAMEBOARD_SIZE = size;
    const SHIP_INFO = [[5, "carrier"], [4, "battleship"], [3, "cruiser"], [3, "submarine"], [2, "destroyer"]];

    const grid = new Array(GAMEBOARD_SIZE);
    const shipsPlaced = new Map();
    const attackedCells = new Map();
    const shipCellMap = new Map();

    let currentOrientation = "H";

    // computer Intelligence
    let lastOpenHit = null;
    let predictiveDirection1 = null;
    let predictiveDirection2 = null;

    function initializeBoard() {
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(grid.length);
            for (let j = 0; j < grid[i].length; j++)
                grid[i][j] = undefined;
        }    
    }
    initializeBoard();

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
        shipsPlaced.set(shipIndex, ship);
        shipCellMap.set(shipIndex, cells);
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

    function getShipCells(shipIndex) {
        if (shipCellMap.has(shipIndex))
            return shipCellMap.get(shipIndex);
    }

    function resetShipPlacement() {
        initializeBoard();
        shipsPlaced.clear();
    }

    function getSunkShips() {
        const sunkShips = [];
        shipsPlaced.forEach((value, key) => {
            if (value._isSunk === true)
                sunkShips.push(key);
        });

        return sunkShips;
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

            // bookkeeping for computer Intelligence
            if (ship._isSunk === true) {
                lastOpenHit = null;
                predictiveDirection1 = null;
                predictiveDirection2 = null;
            }    
            else {
                if (lastOpenHit !== null) {
                    predictiveDirection1 = [(row-lastOpenHit[0]), (col-lastOpenHit[1])];
                    predictiveDirection2 = [(lastOpenHit[0]-row), (lastOpenHit[1]-col)];
                }
                lastOpenHit = [row, col];
            }

            return true;
        }
        else {
            predictiveDirection1 = null;
            predictiveDirection2 = null;
            attackedCells.set(`${row}, ${col}`, "miss");
            return false;
        }       
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

    function predictAdjacentHitCell() {
        if (lastOpenHit === null)
            return null;

        if (predictiveDirection1 === null) {
            const lastHitRow = lastOpenHit[0];
            const lastHitCol = lastOpenHit[1];
            const adjCells = [[lastHitRow-1, lastHitCol], [lastHitRow+1, lastHitCol], 
                                [lastHitRow, lastHitCol+1], [lastHitRow, lastHitCol-1]].filter(cell => {
                                    return (isCellValid(cell) === true && attackedCells.has(`${cell[0]}, ${cell[1]}`) === false)
                                });
            if (adjCells.length === 0)
                return null;

            let cellIndex = Math.floor(Math.random()*adjCells.length);
            let predCell = adjCells[cellIndex];
            return predCell;
        }

        let predCell = [(lastOpenHit[0]+predictiveDirection1[0]), (lastOpenHit[1]+predictiveDirection1[1])];
        if (isCellValid(predCell) === true && attackedCells.has(`${predCell[0]}, ${predCell[1]}`) === false)
            return predCell;

        predCell = [(lastOpenHit[0]+predictiveDirection2[0]), (lastOpenHit[1]+predictiveDirection2[1])];
        if (isCellValid(predCell) === true && attackedCells.has(`${predCell[0]}, ${predCell[1]}`) === false)
            return predCell;

        predictiveDirection1 = null;
        predictiveDirection2 = null;
        return null;
    }

    function isFleetSunk() {
        const totalSunkShips = getSunkShips().length;
        return !(totalSunkShips < shipsPlaced.size);
    }

    return {getBoardSize, getShipInfo, getCellItem, placeShip, getCurrentOrientation, 
        setOrientation, isThisShipPlaced, areShipsPlaced, getShipCells, resetShipPlacement, 
        getSunkShips, receiveAttack, getAttackedCells, placeShipsRandomly, predictAdjacentHitCell, isFleetSunk};
}