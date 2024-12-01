// 2

import { FakeWorksError } from '../core/data.mjs';

class MouseButtons {
  static get left() { return 0; }
  static get wheel() { return 1; }
  static get right() { return 2; }
}

class InputManager {
  /** @type {boolean} */
  #initialized;

  constructor() {
    this.#initialized = false;
    /** @type {boolean} */
    this.ignoreLetterCase = false;
  }

  normalizeKey(key) {
    return this.ignoreLetterCase ? key.toLowerCase() : key;
  }

  getKeyDown(key) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    const normalizedKey = this.normalizeKey(key);
    return this.keyDownStates.has(normalizedKey);
  }

  getKey(key) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    const normalizedKey = this.normalizeKey(key);
    return this.keyStates.get(normalizedKey) || false;
  }

  getKeyUp(key) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    const normalizedKey = this.normalizeKey(key);
    return this.keyUpStates.has(normalizedKey);
  }

  getMouseButtonDown(button) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    return this.mouseDownStates.has(button);
  }

  getMouseButton(button) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    return this.mouseStates.get(button) || false;
  }

  getMouseButtonUp(button) {
    if (!this.#initialized) {
      throw new FakeWorksError('INIT ERROR', 'Initialization is required before using Input');
    }
    return this.mouseUpStates.has(button);
  }

  addKeyDown(key) {
    const normalKey = this.normalizeKey(key);
    if (!this.keyStates.get(normalKey)) {
      this.keyDownStates.add(normalKey);
      this.keyStates.set(normalKey, true);
      requestAnimationFrame(() => this.keyDownStates.delete(normalKey));
    }
  }

  addKeyUp(key) {
    const normalKey = this.normalizeKey(key);
    if (this.keyStates.get(normalKey)) {
      this.keyUpStates.add(normalKey);
      this.keyStates.set(normalKey, false);
      requestAnimationFrame(() => this.keyUpStates.delete(normalKey));
    }
  }

  initialize() {
    this.keyStates = new Map();
    this.keyDownStates = new Set();
    this.keyUpStates = new Set();
    this.mouseStates = new Map();
    this.mouseDownStates = new Set();
    this.mouseUpStates = new Set();
    
    window.addEventListener('keydown', (event) => {
      this.addKeyDown(event.key);
    });
    
    window.addEventListener('keyup', (event) => {
      this.addKeyUp(event.key);
    });

    window.addEventListener('mousedown', (event) => {
      const button = event.button;
      if (!this.mouseStates.get(button)) {
        this.mouseDownStates.add(button);
        this.mouseStates.set(button, true);
        requestAnimationFrame(() => this.mouseDownStates.delete(button));
      }
    });
    
    window.addEventListener('mouseup', (event) => {
      const button = event.button;
      if (this.mouseStates.get(button)) {
        this.mouseUpStates.add(button);
        this.mouseStates.set(button, false);
        requestAnimationFrame(() => this.mouseUpStates.delete(button));
      }
    });

    this.#initialized = true;
  }
}

const Input = new InputManager();

export { MouseButtons };

export default Input;