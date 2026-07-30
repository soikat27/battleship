import Ship from "./ship.js";

/**
 * Factory for one player's board.
 * Handles ship placement, attacks, fleet status, and light AI targeting state.
 * @param {number} [size=10] - board size (rows and cols)
 * @returns {object} board API used by AppController / UI
 */
export default function Gameboard(size=10) {
    const GAMEBOARD_SIZE = size;
    const SHIP_INFO = [[5, "carrier"], [4, "battleship"], [3, "cruiser"], [3, "submarine"], [2, "destroyer"]];

    const grid = new Array(GAMEBOARD_SIZE);
    const shipsPlaced = new Map();
    const attackedCells = new Map();
    const shipCellMap = new Map();

    let currentOrientation = "H";
    // computer intelligence
    let openHitCell = null;
    let predictiveCells = null;

    /** Fills the grid with empty cells. */
    function initializeBoard() {
        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(grid.length);
            for (let j = 0; j < grid[i].length; j++)
                grid[i][j] = undefined;
        }    
    }
    initializeBoard();

    /** @returns {number} board size */
    function getBoardSize() {
        return GAMEBOARD_SIZE;
    }

    /**
     * Fleet list used by the UI (length + name per ship).
     * @returns {Array<[number, string]>}
     */
    function getShipInfo() {
        return [...SHIP_INFO];
    }

    /**
     * What's sitting on a cell — a Ship, or undefined.
     * @param {[number, number]} cell - [row, col]
     * @returns {Ship|undefined}
     */
    function getCellItem(cell) {
        return grid[cell[0]][cell[1]];
    }

    /**
     * Places a ship on the board from a start cell.
     * Validates the ship index, overlap, and board edges first.
     * @param {[number, number]} startCell - [row, col]
     * @param {"H"|"V"} orientation
     * @param {number} shipIndex - index into SHIP_INFO
     * @throws {Error} if the ship can't be placed
     */
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

    /**
     * Builds the cell list for a placement, or false if invalid / overlapping.
     * @param {[number, number]} startCell
     * @param {"H"|"V"} orientation
     * @param {number} shipIndex
     * @returns {Array<[number, number]>|false}
     */
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

    /**
     * @param {[number, number]} cell - [row, col]
     * @returns {boolean}
     */
    function isCellValid(cell) {
        const row = cell[0];
        const col = cell[1];

        if ((row < 0 || row >= GAMEBOARD_SIZE.length) || (col < 0 || col >= GAMEBOARD_SIZE))
            return false;

        return true;
    }

    /** @returns {"H"|"V"} current placement orientation */
    function getCurrentOrientation() {
        return currentOrientation;
    }

    /**
     * Sets placement orientation for drag-and-drop.
     * @param {"H"|"V"} orient
     * @throws {Error} if orient isn't H or V
     */
    function setOrientation(orient) {
        if (orient !== "H" && orient !== "V")
            throw new Error("Invalid orientation");

        currentOrientation = orient;
    }

    /**
     * @param {number} shipIndex
     * @returns {boolean}
     */
    function isThisShipPlaced(shipIndex) {
        return shipsPlaced.has(shipIndex);
    }

    /** @returns {boolean} true once the whole fleet is on the board */
    function areShipsPlaced() {
        return !(shipsPlaced.size < SHIP_INFO.length);
    }

    /**
     * Cells occupied by a placed ship (for sunk styling, etc.).
     * @param {number} shipIndex
     * @returns {Array<[number, number]>|undefined}
     */
    function getShipCells(shipIndex) {
        if (shipCellMap.has(shipIndex))
            return shipCellMap.get(shipIndex);
    }

    /** Clears the grid and placed ships so you can re-place the fleet. */
    function resetShipPlacement() {
        initializeBoard();
        shipsPlaced.clear();
    }

    /**
     * Ship indexes that are fully sunk.
     * @returns {number[]}
     */
    function getSunkShips() {
        const sunkShips = [];
        shipsPlaced.forEach((value, key) => {
            if (value._isSunk === true)
                sunkShips.push(key);
        });

        return sunkShips;
    }

    /**
     * Human-side attack — hit/miss only, no AI targeting state.
     * @param {[number, number]} cell - [row, col]
     * @returns {boolean} true on hit, false on miss
     * @throws {Error} if the cell is invalid or already attacked
     */
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
            return true;
        }
        else {
            attackedCells.set(`${row}, ${col}`, "miss");
            return false;
        }       
    }

    /**
     * Map of attacked cells → "hit" | "miss".
     * @returns {Map<string, string>}
     */
    function getAttackedCells() {
        return attackedCells;
    }

    // for AI player
    /** Drops the whole fleet at random valid spots. */
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

    /**
     * Attack used when the computer shoots this board.
     * Same hit/miss rules as receiveAttack, plus AI bookkeeping
     * (open hit + predictive queue).
     * @param {[number, number]} cell - [row, col]
     * @returns {boolean} true on hit, false on miss
     * @throws {Error} if the cell is invalid or already attacked
     */
    function receiveAttackAI(cell) {
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

            // AI bookkeeping
            if (ship._isSunk === false) {
                if (openHitCell === null)
                    openHitCell = [row, col];
                else {
                    predictiveCells[0].shift();
                    if (predictiveCells[0].length === 0)
                        predictiveCells.shift();
                }
            }
            else {
                openHitCell = null;
                predictiveCells = null;
            }
            return true;
        }
        else {
            attackedCells.set(`${row}, ${col}`, "miss");
            // AI bookkeeping
            if (openHitCell !== null)
                predictiveCells.shift();

            return false;
        }       
    }

    /**
     * Builds (or reuses) a queue of cells to try after an open hit.
     * Rays go out from openHitCell in four directions; empty dirs are skipped.
     * @returns {Array<Array<[number, number]>>|null} predictive queue, or null if hunting
     */
    function predictAdjacentCells() {
        // 1. if no openHitCell, return null
        if (openHitCell === null)
            return null;

        if (predictiveCells !== null)
            return predictiveCells;

        // 2. define directions. a. left.right.up.down, b. up.down.left.right, c. right.left.down.up, d. down.up.right.left
        const dirSet = [ [[-1, 0], [1, 0], [0, 1], [0, -1]], [[0, 1], [0, -1], [-1, 0], [1, 0]], 
                        [[1, 0], [-1, 0], [0, -1], [0, 1]], [[0, -1], [0, 1], [1, 0], [-1, 0]] ];
        const currDirSet = dirSet[Math.floor(Math.random()*4)];
        predictiveCells = [];

        // 3. populate predictiveCells;
        for (let dir of currDirSet) {
            const currPredCells = [];

            for (let i = 1; i <= 4; i++) {
                const offset = [(dir[0]*i), (dir[1]*i)];
                const predCell = [(openHitCell[0]+offset[0]), (openHitCell[1]+offset[1])];
                if (isCellValid(predCell) && attackedCells.has(`${predCell[0]}, ${predCell[1]}`) === false)
                    currPredCells.push(predCell);
                else
                    break;
            }
            if (currPredCells.length > 0)
                predictiveCells.push(currPredCells);

        }
        return predictiveCells;
    }

    /** @returns {boolean} true when every placed ship is sunk */
    function isFleetSunk() {
        const totalSunkShips = getSunkShips().length;
        return !(totalSunkShips < shipsPlaced.size);
    }

    return {getBoardSize, getShipInfo, getCellItem, placeShip, getCurrentOrientation, 
        setOrientation, isThisShipPlaced, areShipsPlaced, getShipCells, resetShipPlacement, 
        getSunkShips, receiveAttack, getAttackedCells, placeShipsRandomly, receiveAttackAI, predictAdjacentCells, isFleetSunk};
}
