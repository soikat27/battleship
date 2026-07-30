/**
 * A player in the game — human or computer.
 * Holds a type, their own gameboard, and an optional display name.
 */
export default class Player {
    /**
     * @param {string} type - "Human" or "AI"
     * @param {object} gameboard - this player's Gameboard instance
     * @param {string} [name] - display name (e.g. captain name or "Computer")
     */
    constructor(type, gameboard, name=undefined) {
        this.type = type;
        this.gameboard = gameboard;
        this.name = name;
    }
}
