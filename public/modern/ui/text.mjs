// 3

import { FakeWorksError, Validator } from '../core/data.mjs';
import GameObject from '../engine/gameObject.mjs';
import { Size, Vector } from '../graphic/data.mjs';

class Text extends GameObject {
  constructor({position = Vector.zero, text, layer = 0}) {
    const element = document.createElement('span');
    element.textContent = text;
    super({
      position: position,
      element: element,
      anchorPoint: new Vector({ x: 0.5, y: 0.5}), 
      layer: layer
    });
  }

  clear(text) {
    this.element.innerText = '';
    this.resize();
  }

  setText(text) {
    this.element.innerText = text;
    this.resize();
  }

  setFontSize(px) {
    this.element.style.fontSize = `${px}px`;
    this.resize();
  }

  addText(text) {
    this.element.innerText += text;
    this.resize();
  }

  resize() {
    const element = this.element;
    const copyElement = document.createElement('span');
    copyElement.innerText = element.innerText;
    copyElement.style.fontSize = element.style.fontSize;
    this.size = Size.fitOf(copyElement);
    this.applySize();
  }
}

export default Text;