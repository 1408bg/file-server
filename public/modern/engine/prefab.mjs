// 3

import { Duration, FakeWorksError, Validator } from '../core/data.mjs';
import { waitForDuration } from '../system/coroutine.mjs';
import GameObject from './gameObject.mjs';

class Prefab {
  /** @type {GameObject} */
  #objectTemplate;
  /** @type {Set} */
  #components;
  /** @type {Set} */
  #instantiatedObjects;

  constructor({object, components = []}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (Validator.isNotClassType(components, Array)) {
      throw FakeWorksError.autoType('components', 'Array');
    }
    this.#objectTemplate = object;
    this.#components = new Set();
    components.forEach((component) => { this.#components.add(component); });
    this.#instantiatedObjects = new Set();
  }

  get count() { return this.#instantiatedObjects.size; }
  get instances() { return this.#instantiatedObjects; }

  instantiate({setupFunction = false}) {
    let instance = this.#objectTemplate.copy();
    if (setupFunction) {
      if (Validator.isNotClassType(setupFunction, Function)) {
        throw autoType('setupFunction', 'Function');
      }
      instance = setupFunction(instance);
      instance.applyElement();
    }
    if (this.#components.size > 0) {
      this.#components.forEach((component) => { instance.addComponent(component); });
    }
    this.#instantiatedObjects.add(instance);
    return instance;
  }

  destroy({object, delay = Duration.zero}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    if (this.#instantiatedObjects.has(object)) {
      waitForDuration(delay).then(() => {
        object.remove(true);
        this.#instantiatedObjects.delete(object);
      });
    }
  }

  destroyAll() {
    for (const object of this.#instantiatedObjects) {
      this.destroy({ object: object });
    }
  }
}

export default Prefab;