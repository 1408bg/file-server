// 4

import { Validator, FakeWorksError } from '../core/data.mjs';
import Color from '../graphic/color.mjs';
import Size from '../graphic/size.mjs';
import GameObject from './gameObject.mjs';
import Scene from './scene.mjs';

/** @typedef {'ANDROID' | 'IOS' | 'WEB'} Platform */

class Game {
  /** @type {HTMLElement} */
  #root;
  /** @type {Platform} */
  #platform;
  /** @type {Map} */
  #scenes;
  /** @type {number} */
  #lastTime;

  constructor({root = false, useFullScreen = false, useDefaultStyle = true, initHTMLStyle = false}) {
    if (!root && !useFullScreen) {
      throw FakeWorksError.value('root or useFullScreen is required');
    }
    if (useFullScreen) {
      root = document.body;
      root.style.width = '100vw';
      root.style.height = '100dvh';
    } else if (Validator.isNotClassType(root, HTMLElement)) {
      throw FakeWorksError.autoType('root', HTMLElement);
    }
    /** @type {Game} */
    window.game = this;
    this.#root = root;
    this.#platform = (() => {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'IOS';
      if (/android|wv/.test(ua)) return 'ANDROID';
      return 'WEB';
    })();
    this.#lastTime = 0;
    this.deltaTime = 0;
    (() => {
      const update = (currentTime) => {
        this.deltaTime = (currentTime - this.#lastTime) / 1000;
        this.#lastTime = currentTime;
        requestAnimationFrame(update);
      };
      requestAnimationFrame((currentTime) => {
        this.#lastTime = currentTime;
        update(currentTime);
      });
    })();
    window.game = this;
    if (useDefaultStyle) {
      root.style.position = 'relative';
      root.style.overflow = 'hidden';
      root.style.userSelect = 'none';
      root.oncontextmenu = ()=>false;
    }
    if (initHTMLStyle) {
      const style = document.createElement('style');
      style.innerHTML = '* { margin: 0 auto; }';
      document.head.appendChild(style);
    }
    this.size = Size.fitOf(root);
    this.width = this.size.width;
    this.height = this.size.height;
    this.#scenes = new Map();
  }

  get platform() { return this.#platform; }

  setBackground({ color = null, url = null }) {
    if (color) {
      if (Validator.isNotClassType(color, Color)) {
        throw FakeWorksError.autoType('color', 'Color');
      }
      this.#root.style.backgroundColor = color.toString();
    } else if (url) {
      this.#root.style.backgroundImage = `url('${url}')`;
    } else {
      throw FakeWorksError.value('Either color or url needs a factor');
    }
  }

  contains(object) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'Object');
    }
    return !(this.width < object.position.x ||
    0 > object.position.x + object.size.width ||
    this.height < object.position.y ||
    0 > object.position.y + object.size.height);
  }

  createScene(name) {
    const scene = new Scene({root: this.#root});
    this.#scenes.set(name, scene);
    return scene;
  }

  getScene(name) {
    return this.#scenes.get(name);
  }

  loadScene({scene, args = null }) {
    if (Validator.isNotClassType(scene, Scene)) {
      throw FakeWorksError.autoType('scene', 'Scene');
    }
    if (args !== null && Validator.isNotClassType(args, Array)) {
      throw FakeWorksError.autoType('args', 'Array');
    }
    this.#scenes.forEach((e) => {
      if (e.playing) e.kill();
    });
    scene.run(args);
  }

  loadSceneNamed({name, args = null }) {
    const scene = this.#scenes.get(name);
    if (Validator.isNotClassType(scene, Scene)) {
      throw FakeWorksError.value(`scene named '${name}' is invaild or null`);
    }
    this.loadScene({scene: scene, args: args });
  }
}

export default Game;