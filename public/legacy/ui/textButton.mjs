// 2

import Entity from "../entity/entity.mjs";
import Position from "../graphic/position.mjs";
import { Color } from "../graphic/data.mjs";
import Text from "./text.mjs";

class TextButton extends Entity {
  /**
  * 글자를 content로 가지는 버튼을 생성합니다.
  * @param {Text} text 글자
  * @param {Function} onClick 클릭 시 실행될 함수
  * @param {Object} [options] 버튼 스타일 옵션
  * @param {Color} [options.backgroundColor] 배경색
  * @param {number} [options.elevation] 그림자 강도 (0-5)
  */
  constructor(text, onClick, options = {}) {
    super(text.position, text.size, text, 10);
    
    const {
      backgroundColor = Color.transparent(),
      elevation = 0
    } = options;

    text.position = new Position(0, 0);
    this.onClick = onClick;
    this.text = ()=>text;
    this.clickHandler = ()=>this.onClick(this);
    
    this.backgroundColor = backgroundColor;
    this.elevation = elevation;
  }

  render() {
    const entity = document.createElement('div');
    entity.style.position = 'absolute';
    entity.style.width = `${this.size.width}px`;
    entity.style.height = `${this.size.height}px`;
    entity.style.left = `${this.position.x}px`;
    entity.style.top = `${this.position.y}px`;
    entity.style.zIndex = this.layer;
    entity.style.cursor = 'pointer';
    entity.style.borderRadius = '4px';
    entity.style.padding = '8px 16px';
    entity.style.backgroundColor = this.backgroundColor.toString();
    
    if (this.elevation > 0) {
      const shadows = [
        '0 2px 2px 0 rgba(0,0,0,0.14)',
        '0 3px 1px -2px rgba(0,0,0,0.12)',
        '0 1px 5px 0 rgba(0,0,0,0.20)'
      ];
      entity.style.boxShadow = shadows.slice(0, this.elevation).join(',');
    }

    entity.appendChild(this.text().render());

    this.element = entity;
    entity.addEventListener('click', this.clickHandler);
    
    return entity;
  }

  destroy() {
    if (this.element) {
      this.element.removeEventListener('click', this.clickHandler);
    }
    super.destroy();
  }

  visibility(visible) {
    this.text().visibility(visible);
  }
}

export default TextButton;