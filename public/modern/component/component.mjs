// 3

import { FakeWorksError, Validator } from './../core/data.mjs';
import GameObject from '../engine/gameObject.mjs';

class Component {
  /** @type {GameObject} */
  #object;

  initialize({object}) {
    if (Validator.isNotClassType(object, GameObject)) {
      throw FakeWorksError.autoType('object', 'GameObject');
    }
    this.#object = object;
  }

  remove() {
    this.#object = null;
  }

  get object() { return this.#object; }
}

export default Component;