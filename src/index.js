/**
 * Battleship entry — loads styles and boots the UI.
 */
import "./styles/normalize.css";
import "./styles/index.css";
import UIController from "./modules/ui-controller.js";

// start the game...
const battleShipGame = UIController();
battleShipGame.initializeApp();
