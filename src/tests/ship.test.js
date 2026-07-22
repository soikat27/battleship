// Import test helpers so ESLint recognizes them
import {test, expect} from "@jest/globals";
import Ship from "../modules/ship.js";

test("ship of length: 0", () => {
  const testShip = new Ship(0);
  expect(testShip.isSunk()).toBe(true);

  testShip.hit();
  expect(testShip.hitCount).toBe(0);
  expect(testShip.isSunk()).toBe(true);
});

test("ship of length: 3", () => {
  const testShip = new Ship(3);
  expect(testShip.isSunk()).toBe(false);

  testShip.hit();
  testShip.hit();
  expect(testShip.hitCount).toBe(2);
  expect(testShip.isSunk()).toBe(false);
  testShip.hit();
  expect(testShip.isSunk()).toBe(true);
  testShip.hit();
  expect(testShip.hitCount).toBe(3);
});
