// 2

import Entity from "../entity/entity.mjs";
import Color from "../graphic/color.mjs";
import { Position, Size } from "../graphic/data.mjs";

class Text extends Entity {
  /**
  * @param {Position} position 위치를 지정하는 Position 객체
  * @param {String} text 문자
  * @param {Size} [size] 크기
  * @param {String} [fontSize] 폰트 크기
  * @param {String} [fontWeight] 폰트 굵기
  * @param {String|Color} [color] 색상
  */
  constructor(position, text, size, fontSize = "16px", fontWeight = "400", color = "black") {
    const content = document.createElement("span");
    content.style.fontSize = fontSize;
    content.style.fontWeight = fontWeight;
    if (color instanceof Color) {
      content.style.color = color.toString();
    } else {
      content.style.color = color;
    }
    content.innerText = text;
    size = size ?? Size.fitOf(content);
    super(position, size, content, 10);
  }

  /**
  * 자신의 값을 반환합니다.
  * @returns {String} 텍스트 값
  */
  getText() {
    return this.originalContent().innerText;
  }

  /**
  * 자신의 값을 변경합니다.
  * @param {String} text
  */
  setText(text) {
    this.originalContent().innerText = text;
    this.size = Size.fitOf(this.originalContent());
  }

  /**
  * 자신의 값을 추가합니다.
  * @param {String} text 
  */
  addText(text) {
    this.originalContent().innerText += text;
    this.size = Size.fitOf(this.originalContent());
  }

  /**
  * 자신의 색을 변경합니다.
  * @param {Color} color
  */
  setColor(color) {
    this.originalContent().style.color = color.toString();
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
    super.destroy();
  }
}

export default Text;