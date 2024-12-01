// 3

import { Validator, FakeWorksError } from '../core/data.mjs';
import GameObject from './gameObject.mjs';

class Scene {
  /** @type {HTMLElement} */
  #root;
  /** @type {Set} */
  #objects;
  /** @type {Set} */
  #elements;
  /** @type {Function} */
  #onLoad;
  /** @type {Function} */
  #onUnload;
  /** @type {boolean} */
  #playing;

  constructor({root}) {
    if (Validator.isNotClassType(root, HTMLElement)) {
      throw FakeWorksError.autoType('root', HTMLElement);
    }
    this.#root = root;
    this.#objects = new Set();
    this.#elements = new Set();
    this.#playing = false;
  }

  get playing() { return this.#playing; }

  addObject({object, layer = false}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    if (layer) object.layer = layer;
    this.#objects.add(object);
    if (this.#root && this.#playing) this.#root.appendChild(object.element);
    return object;
  }

  addObjectAll({objects, layer = false}) {
    if (Validator.isNotClassType(objects, Array)) {
      throw FakeWorksError.autoType('objects', 'Array');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    objects.forEach((e) => {
      this.addObject({object: e, layer: layer});
    });
  }

  addElement({element, layer = false}) {
    if (Validator.isNotClassType(element, HTMLElement)) {
      throw FakeWorksError.autoType('element', 'HTMLElement');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    if (layer) element.style.zIndex = layer;
    this.#elements.add(element);
    if (this.#root && this.#playing) this.#root.appendChild(element);
    return element;
  }

  addElementAll({elements, layer = false}) {
    if (Validator.isNotClassType(elements, Array)) {
      throw FakeWorksError.autoType('elements', 'Array');
    }
    if (layer) {
      if (!Validator.isPositive(layer) || !Validator.isInteger(layer)) {
        throw FakeWorksError.value('layer', 'layer must be positive integer');
      }
    }
    elements.forEach((e) => {
      this.addElement({element: e, layer: layer});
    });
  }

  removeObject(object) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (this.#objects.has(object)) {
      object.remove();
      this.#objects.delete(object);
    }
  }

  removeElement(element) {
    if (Validator.isNotClassType(element, HTMLElement)) {
      throw FakeWorksError.autoType('element', 'HTMLElement');
    }
    if (this.#elements.has(element)) {
      this.#root.removeChild(element);
      this.#elements.delete(element);
    }
  }

  hasObject(object) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    return this.#objects.has(object);
  }

  set onLoad(onLoadFunction) {
    if (Validator.isNotClassType(onLoadFunction, Function)) {
      throw FakeWorksError.autoType('onLoadFunction', 'Function');
    }
    this.#onLoad = onLoadFunction;
  }

  set onUnload(onUnloadFunction) {
    if (Validator.isNotClassType(onUnloadFunction, Function)) {
      throw FakeWorksError.autoType('onunLoadFunction', 'Function');
    }
    this.#onUnload = onUnloadFunction;
  }

  get onLoad() { return this.#onLoad; }
  get onUnload() { return this.#onUnload; }

  run(args = null) {
    const objects = new Set();
    this.#objects.forEach((e) => {
      e.awake();
      if (e.element) {
        objects.add(e);
        this.#root.appendChild(e.element);
      }
    });
    this.#objects = objects;
    this.#elements.forEach((e) => {
      this.#root.appendChild(e);
    });
    this.#playing = true;
    if (this.#onLoad) args !== null ? this.#onLoad(...args) : this.#onLoad();
  }

  kill() {
    this.#objects.forEach((e) => {
      e.remove();
    });
    this.#elements.forEach((e) => {
      e.remove();
    })
    this.#playing = false;
    if (this.#onUnload) this.#onUnload();
  }
}

export default Scene;