/**
 * A single ship on the board.
 * Tracks length, how many times it's been hit, and whether it's sunk.
 */
export default class Ship {
    /**
     * @param {number} length - how many cells this ship takes
     */
    constructor(length) {
        this.length = length;
        this.hitCount = 0;
        this._isSunk = this.isSunk();
    }

    /**
     * Registers one hit on this ship (won't go past length).
     */
    hit() {
        if (this.hitCount < this.length) {
            this.hitCount++;
            this._isSunk = this.isSunk();
        }
    }

    /**
     * @returns {boolean} true once every cell of the ship has been hit
     */
    isSunk() {
        if (this.hitCount >= this.length)
            return true;
        return false;
    }
}
