// Import test helpers so ESLint recognizes them
import {test, expect, describe} from "@jest/globals";
import Gameboard from "../modules/gameboard.js";
import Ship from "../modules/ship.js";

describe("place ship test", () => {
    test("invalid ship placement test: invalid cells", () => {
        const testBoard = Gameboard();
        expect(() => {testBoard.placeShip([2, 13], "V", 3);}).toThrow(new Error("The ship can't be placed!"));
    });
    test("invalid ship placement test: no such ship", () => {
        const testBoard = Gameboard();
        expect(() => {testBoard.placeShip([2, 2], "V", 5);}).toThrow(new Error("No such ship!"));
    });
    test("invalid ship placement test: overlap", () => {
        const testBoard = Gameboard();
        testBoard.placeShip([1, 2], "V", 3);
        expect(() => {testBoard.placeShip([3, 1], "H", 2);}).toThrow(new Error("The ship can't be placed!"));
    });
    test("invalid ship placement test: no available ship", () => {
        const testBoard = Gameboard();
        testBoard.placeShip([0, 0], "H", 0);
        testBoard.placeShip([1, 0], "H", 1);
        testBoard.placeShip([2, 0], "H", 2);
        testBoard.placeShip([3, 0], "H", 3);
        testBoard.placeShip([4, 0], "H", 4);
        expect(() => {testBoard.placeShip([3, 1], "H", 2);}).toThrow(new Error("All ships have been placed!"));
    });

    test("ship placement test-H: valid", () => {
        const testBoard = Gameboard();
        testBoard.placeShip([1, 2], "H", 0);

        expect(testBoard.getCellItem([1, 2])).toEqual(new Ship(5));
        expect(testBoard.getCellItem([1, 3])).toEqual(new Ship(5));
        expect(testBoard.getCellItem([1, 4])).toEqual(new Ship(5));
        expect(testBoard.getCellItem([1, 5])).toEqual(new Ship(5));
        expect(testBoard.getCellItem([1, 6])).toEqual(new Ship(5));
        expect(testBoard.getCellItem([1, 7])).toBeUndefined();
    });
    test("ship placement test-V: valid", () => {
        const testBoard = Gameboard();
        testBoard.placeShip([6, 7], "V", 4);

        expect(testBoard.getCellItem([6, 7])).toEqual(new Ship(2));
        expect(testBoard.getCellItem([7, 7])).toEqual(new Ship(2));
        expect(testBoard.getCellItem([8, 7])).toBeUndefined();
    });

    test("invalid ship placement test: duplicate ship", () => {
        const testBoard = Gameboard();
        testBoard.placeShip([0, 0], "H", 4);
        expect(() => {testBoard.placeShip([1, 0], "H", 4);}).toThrow(new Error("This ship has already been placed!"));
    });
});

describe("receive attack test", () => {
    test("invalid cell", () => {
        const testBoard = Gameboard();
        expect(() => {testBoard.receiveAttack([0, 10]);}).toThrow(new Error("Invalid cell!"));
    });

    test("already a hit cell", () => {
        const testBoard = Gameboard();
        testBoard.receiveAttack([0, 5]);
        expect(() => {testBoard.receiveAttack([0, 5]);}).toThrow(new Error("Already hit! Choose another cell!"));
    });

    test("missed attack", () => {
        const testBoard = Gameboard();
        testBoard.receiveAttack([3, 9]);
        expect(testBoard.getCellItem([3, 9])).toBe("miss");
    });

    test("successful attack", () => {
        const testBoard = Gameboard();
        testBoard.placeShip([0, 0], "H", 0);
        expect(testBoard.getCellItem([0, 0]).hitCount).toBe(0);

        testBoard.receiveAttack([0, 0]);
        expect(testBoard.getCellItem([0, 0]).hitCount).toBe(1);

        testBoard.receiveAttack([0, 1]);
        testBoard.receiveAttack([0, 2]);
        expect(testBoard.getCellItem([0, 0]).hitCount).toBe(3);
        
        testBoard.receiveAttack([0, 3]);
        testBoard.receiveAttack([0, 4]);
        expect(testBoard.getCellItem([0, 0]).hitCount).toBe(5);
        expect(testBoard.getCellItem([0, 0])._isSunk).toBe(true);
    });
});



