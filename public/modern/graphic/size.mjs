// 1

import { FakeWorksError, Validator } from '../core/data.mjs';

class Size {
  /** @type {number} */
  #width;
  /** @type {number} */
  #height;
  constructor({width, height}) {
    if (!Validator.isPositiveAll(width, height)) {
      throw FakeWorksError.value('width and height must be Positive');
    }
    this.#width = width;
    this.#height = height;
  }

  get width() { return this.#width };
  get height() { return this.#height; }

  set width(value) {
    if (!Validator.isPositive(value)) {
      throw FakeWorksError.value('width must be positive');
    }
    this.#width = value;
  }

  set height(value) {
    if (!Validator.isPositive(value)) {
      throw FakeWorksError.value('height must be positive');
    }
    this.#height = value;
  }

  static fitOf(node) {
    if (Validator.isNotClassType(node, Node)) {
      throw FakeWorksError.autoType('node', 'Node');
    }
    const target = node.cloneNode(true);
    target.style.visibility = 'hidden';
    target.style.position = 'absolute';
    target.style.left = '-9999px';
    target.style.whiteSpace = 'nowrap';
    target.style.display = 'inline-block';
    document.body.appendChild(target);
    const rect = target.getBoundingClientRect();
    const size = {
      width: rect.width,
      height: rect.height
    };
    document.body.removeChild(target);
    return new Size(size);
  }
  
  copy() {
    return new Size({
      width: this.width,
      height: this.height
    });
  }

  contains(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    return (this.width >= size.width) && (this.height >= size.height);
  }

  equals(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    return this.width === size.width && this.height === size.height;
  }

  scale(factor) {
    if (!Validator.isFloat(factor)) {
      throw FakeWorksError.autoType('factor', 'Float');
    }
    if (factor <= 0) {
      throw FakeWorksError.value('factor must be greater than zero');
    }
    this.width *= factor;
    this.height *= factor;
    return this;
  }

  increase({width = 0, height = 0}) {
    if (!Validator.isNumberAll(width, height)) {
      throw FakeWorksError.type('width, height must be Number');
    }
    this.width = Math.max(0, this.width + width);
    this.height = Math.max(0, this.height + height);
    return this;
  }

  decrease({width = 0, height = 0}) {
    if (!Validator.isNumberAll(width, height)) {
      throw FakeWorksError.type('width, height must be Number');
    }
    this.width = Math.max(0, this.width - width);
    this.height = Math.max(0, this.height - height);
    return this;
  }

  area() {
    return this.width * this.height;
  }

  add(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    this.width = Math.max(0, this.width + size.width);
    this.height = Math.max(0, this.height + size.height);
    return this;
  }

  subtract(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    this.width = Math.max(0, this.width - size.width);
    this.height = Math.max(0, this.height - size.height);
    return this;
  }

  divide(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    if (size.width === 0 || size.height === 0) {
      throw FakeWorksError.calc('Cannot divide by zero in size dimensions');
    }
    this.width /= size.width;
    this.height /= size.height;
    return this;
  }

  aspectRatio() {
    if (this.height === 0) {
      throw FakeWorksError.calc('Height cannot be zero when calculating aspect ratio');
    }
    return this.width / this.height;
  }

  toString() {
    return `Size(width: ${this.width}px, height: ${this.height}px)`;
  }
}

export default Size;