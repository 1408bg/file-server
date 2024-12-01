// 2

import Component from '../component/component.mjs';
import { FakeWorksError, Validator } from '../core/data.mjs';
import { Size, Vector } from '../graphic/data.mjs';

class GameObject {
  /** @type {boolean} */
  #alive;
  /** @type {Vector} */
  #position;
  /** @type {Size} */
  #size;
  /** @type {HTMLElement} */
  #element;
  /** @type {Vector} */
  #anchorPoint;
  /** @type {number} */
  #layer;
  /** @type {Object} */
  #transformState;
  /** @type {Set} */
  #components;

  constructor({position = Vector.zero, element, size = undefined, anchorPoint = Vector.zero, layer = 0}) {
    if (size === undefined) {
      size = Size.fitOf(element);
    }
    if (Validator.isNotClassType(position, Vector)) {
      throw FakeWorksError.autoType('position', 'Vector');
    }
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    if (Validator.isNotClassType(element, HTMLElement)) {
      throw FakeWorksError.autoType('element', 'HTMLElement');
    }
    if (Validator.isNotClassType(anchorPoint, Vector)) {
      throw FakeWorksError.autoType('anchorPoint', 'Vector');
    }
    if (!Validator.isInteger(layer)) {
      throw FakeWorksError.autoType('layer', 'Integer');
    }
    this.#alive = true;
    this.#position = position;
    this.#size = size;
    this.#element = element;
    this.#anchorPoint = anchorPoint;
    this.#layer = layer;
    this.#transformState = {
      translate: { x: 0, y: 0 },
      rotate: 0,
      scale: { x: 1, y: 1 },
      skew: { x: 0, y: 0 },
    };
    this.#components = new Set();
    element.style.position = 'absolute';
    element.style.willChange = 'width, height, left, top, transform-origin';
    element.style.width = `${size.width}px`;
    element.style.height = `${size.height}px`;
    this.applyAnchorPoint();
    element.style.zIndex = layer;
  }

  static colored({position = Vector.zero, color, size, layer = 0}) {
    const element = document.createElement('div');
    element.style.backgroundColor = color.toString();
    return new GameObject({
      position: position,
      element: element,
      size: size,
      layer: layer
    });
  }

  get position() { return this.#position; }
  get size() { return this.#size; }
  get element() { return this.#alive ? this.#element : null; }
  get anchorPoint() { return this.#anchorPoint; }
  get layer() { return this.#layer; }
  
  set position(newPosition) {
    if (Validator.isNotClassType(newPosition, Vector)) {
      throw FakeWorksError.autoType('newPosition', 'Vector');
    }
    this.#position = newPosition;
    this.applyPosition();
  }
  
  set size(newSize) {
    if (Validator.isNotClassType(newSize, Size)) {
      throw FakeWorksError.autoType('newSize', 'Size');
    }
    this.#size = newSize;
    this.applySize();
  }
  
  set element(newElement) {
    if (Validator.isNotClassType(newElement, HTMLElement)) {
      throw FakeWorksError.autoType('newElement', 'HTMLElement');
    }
    this.#element = newElement;
    this.applyElement();
  }

  set anchorPoint(newAnchorPoint) {
    if (Validator.isNotClassType(newAnchorPoint, Vector)) {
      throw FakeWorksError.autoType('newAnchorPoint', 'Vector');
    }
    this.#anchorPoint = newAnchorPoint;
    this.applyAnchorPoint();
    this.applyPosition();
  }
  
  set layer(newLayer) {
    if (!Validator.isInteger(newLayer)) {
      throw FakeWorksError.autoType('newLayer', 'Integer');
    }
    this.#layer = newLayer;
    this.applyLayer();
  }

  /**
  * @typedef {'translate' | 'rotate' | 'scale' | 'skew'} TransformStateKeys
  * @param {TransformStateKeys} type
  */
  setTransform(type, value) {
    if (!this.#alive) return;
    this.#transformState[type] = value;
    this.applyTransform();
  }

  generateTransformString() {
    const { translate, rotate, scale, skew } = this.#transformState;
    return `
      translate(${translate.x}px, ${translate.y}px)
      rotate(${rotate}deg)
      scale(${scale.x}, ${scale.y})
      skew(${skew.x}deg, ${skew.y}deg)
    `.trim();
  }

  applyTransform() {
    if (!this.#element) return;
    this.#element.style.transform = this.generateTransformString();
  }
  
  applyPosition() {
    if (!this.#alive) return;
    const adjustedX = this.#position.x - this.#anchorPoint.x * this.#size.width;
    const adjustedY = this.#position.y - this.#anchorPoint.y * this.#size.height;
    this.#element.style.left = `${adjustedX}px`;
    this.#element.style.top = `${adjustedY}px`;
  }

  applySize() {
    if (!this.#alive) return;
    this.#element.style.width = `${this.#size.width}px`;
    this.#element.style.height = `${this.#size.height}px`;
  }

  applyElement() {
    if (!this.#alive) return;
    const element = this.#element;
    element.style.width = `${this.size.width}px`;
    element.style.height = `${this.size.height}px`;
    element.style.left = `${this.position.x}px`;
    element.style.top = `${this.position.y}px`;
    element.style.zIndex = this.layer;
  }

  applyAnchorPoint() {
    if (!this.#alive) return;
    const { x, y } = this.#anchorPoint;
    this.#element.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    this.applyPosition();
  }

  applyLayer() {
    if (!this.#alive) return;
    this.#element.style.zIndex = this.#layer;
  }
  
  copy() {
    return new GameObject({
      position: this.#position.copy(),
      size: this.#size.copy(),
      element: this.#element.cloneNode(true),
      anchorPoint: this.#anchorPoint.copy(),
      layer: this.layer
    });
  }

  awake() {
    if (!this.#alive) this.#alive = true;
  }

  remove(deep = false) {
    for (const component of this.#components) { this.removeComponent(component); }
    if (this.#alive) {
      document.body.removeChild(this.element);
      this.#alive = false;
    }
    if (deep) {
      this.#element = null;
    }
  }

  isCollide(other) {
    if (Validator.isNotClassType(other, GameObject)) {
      throw FakeWorksError.autoType('other', 'GameObject');
    }
    return (
      this.position.x < other.position.x + other.size.width &&
      this.position.x + this.size.width > other.position.x &&
      this.position.y < other.position.y + other.size.height &&
      this.position.y + this.size.height > other.position.y
    );
  }

  addComponent(component) {
    if (Validator.isNotClassType(component, Component)) {
      throw FakeWorksError.autoType('component', 'Component');
    }
    component.initialize({ object: this });
    this.#components.add(component);
  }

  removeComponent(component) {
    if (Validator.isNotClassType(component, Component)) {
      throw FakeWorksError.autoType('component', 'Component');
    }
    if (this.#components.has(component)) {
      component.remove();
      this.#components.delete(component);
    }
  }

  getComponent(componentType) {
    for (const component of this.#components) {
      if (component instanceof componentType) return component;
    }
    return null;
  }
}

export default GameObject;