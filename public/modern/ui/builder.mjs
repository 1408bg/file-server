// 2

import { FakeWorksError, Validator } from '../core/data.mjs';
import { Size, Vector } from '../graphic/data.mjs';

class ElementTheme {
  constructor({
    backgroundColor = "#fff",
    textColor = "#000",
    borderRadius = "4px",
    padding = "8px",
    boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)",
  } = {}) {
    this.backgroundColor = backgroundColor;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.padding = padding;
    this.boxShadow = boxShadow;
  }

  setTheme({ backgroundColor, textColor, borderRadius, padding, boxShadow } = {}) {
    if (backgroundColor) this.backgroundColor = backgroundColor;
    if (textColor) this.textColor = textColor;
    if (borderRadius) this.borderRadius = borderRadius;
    if (padding) this.padding = padding;
    if (boxShadow) this.boxShadow = boxShadow;
    return this;
  }
}

class ElementBuilder {
  /** @type {HTMLElement} */
  #element;
  /** @type {ElementTheme} */
  static #themeData = new ElementTheme();

  static get themeData() { return ElementBuilder.#themeData; }
  static set themeData(newThemeData) {
    if (Validator.isNotClassType(newThemeData, ElementTheme)) {
      throw FakeWorksError.autoType('newThemeData', 'ElementTheme');
    }
    ElementBuilder.#themeData = newThemeData;
  }

  constructor(tagName) {
    this.#element = document.createElement(tagName);
  }

  setClass(...classNames) {
    this.#element.classList.add(...classNames);
    return this;
  }

  setText(text) {
    this.#element.textContent = text;
    return this;
  }

  setAttributes(attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      this.#element.setAttribute(key, value);
    }
    return this;
  }

  setStyle(styles) {
    for (const [key, value] of Object.entries(styles)) {
      this.#element.style[key] = value;
    }
    return this;
  }

  
  setSize(size) {
    if (Validator.isNotClassType(size, Size)) {
      throw FakeWorksError.autoType('size', 'Size');
    }
    const sizeStyle = {};
    sizeStyle.width = size.width+'px';
    sizeStyle.height = size.height+'px';
    return this.setStyle(sizeStyle);
  }
  
  setPosition(position) {
    if (Validator.isNotClassType(position, Vector)) {
      throw FakeWorksError.autoType('position', 'Vector');
    }
    return this.setStyle({
      'position': 'relative',
      'left': `${position.x}px`,
      'top': `${position.y}px`
    });
  }

  onHover(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mouseenter', (event)=>handler(event, this.#element));
    return this;
  }

  onHoverOut(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mouseout', (event)=>handler(event, this.#element));
    return this;
  }
  
  onPress(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener("click", (event)=>handler(event, this.#element));
    return this;
  }

  onPressStart(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mousedown', (event)=>handler(event, this.#element));
    this.#element.addEventListener('touchstart', (event)=>handler(event, this.#element));
    return this;
  }

  onPressEnd(handler) {
    if (Validator.isNotClassType(handler, Function)) {
      throw FakeWorksError.autoType('handler', 'Function');
    }
    this.#element.addEventListener('mouseup', (event)=>handler(event, this.#element));
    this.#element.addEventListener('touchend', (event)=>handler(event, this.#element));
    this.#element.addEventListener('touchcancel', (event)=>handler(event, this.#element));
    return this;
  }

  center() {
    this.#element.style.transform = 'translate(-50%, -50%)';
    return this;
  }

  asButton() {
    this.setStyle({
      backgroundColor: ElementBuilder.#themeData.backgroundColor,
      color: ElementBuilder.#themeData.textColor,
      borderRadius: ElementBuilder.#themeData.borderRadius,
      padding: ElementBuilder.#themeData.padding,
      boxShadow: ElementBuilder.#themeData.boxShadow,
      border: "none",
      cursor: "pointer",
      display: "inline-block",
      textAlign: "center"
    });
    return this;
  }

  asCard() {
    this.setStyle({
      backgroundColor: ElementBuilder.#themeData.backgroundColor,
      color: ElementBuilder.#themeData.textColor,
      borderRadius: ElementBuilder.#themeData.borderRadius,
      padding: ElementBuilder.#themeData.padding,
      boxShadow: ElementBuilder.#themeData.boxShadow,
      display: "block"
    });
    return this;
  }

  build() {
    return this.#element;
  }
}

export default ElementBuilder;