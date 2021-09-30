'use strict'

import { Game } from "./game.js";

var game;

window.onload = () =>
{
    game = new Game(1280, 720);
    game.start();
}