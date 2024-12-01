// 4

import { Vector, Size } from '../graphic/data.mjs';
import { FakeWorksError, Validator } from '../core/data.mjs';
import Component from '../component/component.mjs';

class Collider extends Component {
  /** @type {Vector} */
  #offset;
  /** @type {Size} */
  #size;

  constructor({ offset, size }) {
    super();
    if (Validator.isNotClassType(offset, Vector)) {
      throw FakeWorksError.autoType('position', 'Vector');
    }
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    this.#offset = offset;
    this.#size = size;
  }

  get position() { return this.#offset; }
  set position(newPosition) {
    if (Validator.isNotClassType(newPosition, Vector)) {
      throw FakeWorksError.autoType('newPosition', 'Vector');
    }
    this.#offset = newPosition;
  }

  get size() { return this.#size; }
  set size(newSize) {
    if (Validator.isNotClassType(newSize, Size)) {
      throw FakeWorksError.autoType('newSize', 'Size');
    }
    this.#size = newSize;
  }

  isCollide(other) {
    if (Validator.isNotClassType(other, Collider)) {
      throw FakeWorksError.autoType('other', 'Collider');
    }
    return (
      this.#offset.x < other.position.x + other.size.width &&
      this.#offset.x + this.#size.width > other.position.x &&
      this.#offset.y < other.position.y + other.size.height &&
      this.#offset.y + this.#size.height > other.position.y
    );
  }

  contains(point) {
    if (Validator.isNotClassType(point, Vector)) {
      throw FakeWorksError.autoType('point', 'Vector');
    }
    return (
      point.x >= this.#offset.x &&
      point.x <= this.#offset.x + this.#size.width &&
      point.y >= this.#offset.y &&
      point.y <= this.#offset.y + this.#size.height
    );
  }

  move(newPosition) {
    if (Validator.isNotClassType(newPosition, Vector)) {
      throw FakeWorksError.autoType('newPosition', 'Vector');
    }
    this.#offset = newPosition;
    return this;
  }

  copy() {
    return new Collider({
      position: this.#offset.copy(),
      size: this.#size.copy(),
    });
  }

  toString() {
    return `Collider(position: ${this.#offset.toString()}, size: ${this.#size.toString()})`;
  }
}

export default Collider;