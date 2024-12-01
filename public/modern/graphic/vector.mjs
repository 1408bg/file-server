// 1

import { FakeWorksError, Validator } from './../core/data.mjs';

class Vector {
  constructor({x, y}) {
    if (!Validator.isNumber(x) || !Validator.isNumber(y)) {
      throw FakeWorksError.autoType('x and y', 'number');
    }
    this.x = x;
    this.y = y;
  }

  static get zero() { return new Vector({x: 0, y: 0}); }

  copy() {
    return new Vector({x: this.x, y: this.y});
  }

  increase({x = 0, y = 0}) {
    if (!Validator.isNumber(x) || !Validator.isNumber(y)) {
      throw FakeWorksError.autoType('x and y', 'number');
    }
    this.x += x;
    this.y += y;
    return this;
  }

  decrease({x = 0, y = 0}) {
    if (!Validator.isNumber(x) || !Validator.isNumber(y)) {
      throw FakeWorksError.autoType('x and y', 'number');
    }
    this.x -= x;
    this.y -= y;
    return this;
  }

  set(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  distance(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2);
  }

  equals(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return this.x === vector.x && this.y === vector.y;
  }

  angle(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return Math.atan2(vector.y - this.y, vector.x - this.x);
  }

  moveByAngle(angle, distance) {
    if (!Validator.isNumberAll(angle, distance)) {
      throw FakeWorksError.autoType('angle and distance', 'number');
    }
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    this.x += dx;
    this.y += dy;
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? this.copy() : new Vector({ x: this.x / mag, y: this.y / mag });
  }

  dotProduct(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return this.x * vector.x + this.y * vector.y;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  scale(scalar) {
    if (!Validator.isNumber(scalar)) {
      throw FakeWorksError.autoType('scalar', 'number');
    }
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    if (!Validator.isNumber(scalar)) {
      throw FakeWorksError.autoType('scalar', 'number');
    }
    if (scalar === 0) {
      throw FakeWorksError.value('can not divide with zero');
    }
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  crossProduct(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    return this.x * vector.y - this.y * vector.x;
  }

  add(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  subtract(vector) {
    if (Validator.isNotClassType(vector, Vector)) {
      throw FakeWorksError.autoType('vector', 'Vector');
    }
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  toString() {
    return `Vector(x: ${this.x}, y: ${this.y})`;
  }
}

export default Vector;