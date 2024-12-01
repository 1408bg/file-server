import { Color } from '../graphic/data.mjs';
import { Game } from '../engine/data.mjs';
import Input from '../system/input.mjs';
import setupMainScene from './scenes/mainScene.js';
import setupEndScene from './scenes/endScene.js';

Input.initialize();
Input.ignoreLetterCase = true;

const game = new Game({ useFullScreen: true, initHTMLStyle: true });
game.setBackground({ color: Color.fromHex('#87CEEB') });

setupMainScene();
setupEndScene();

game.loadSceneNamed({name: 'main'});
