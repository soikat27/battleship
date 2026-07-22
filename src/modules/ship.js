export default class Ship {
    constructor(length) {
        this.length = length;
        this.hitCount = 0;
        this._isSunk = this.isSunk();
    }

    hit() {
        if (this.hitCount < this.length) {
            this.hitCount++;
            this._isSunk = this.isSunk();
        }
    }

    isSunk() {
        if (this.hitCount >= this.length)
            return true;
        return false;
    }
}