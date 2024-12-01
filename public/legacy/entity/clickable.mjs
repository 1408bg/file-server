// 2

import Entity from './entity.mjs';
import { Color, Position, Size } from '../graphic/data.mjs';

/**
* click 이벤트를 감지할 수 있는 Entity입니다.
* click 요소를 클릭하면 onClick 콜백이 실행됩니다.
*/
class Clickable extends Entity {
  /**
  * @param {Position} position 위치를 지정하는 Position 객체
  * @param {Size} size 크기를 지정하는 Size 객체
  * @param {string|HTMLElement|Color} content 배경색, 배경 이미지 또는 하위 DOM 요소
  * @param {Function} onClick 클릭 시 호출될 함수 (this) => void
  */
  constructor(position, size, content, onClick) {
    super(position, size, content);
    this.onClick = onClick;
  }

  /**
  * Entity에 해당하는 div 요소를 생성하고 클릭 이벤트 리스너를 추가합니다.
  * @returns {HTMLElement} div 요소
  */
  render() {
    const entity = super.render();
    entity.addEventListener('click', ()=>this.onClick(this));
    return entity;
  }

  /**
  * 자신의 복사본을 반환합니다.
  * @returns {Clickable} 새로운 Clickable 객체
  */
  copy() {
    return new Clickable(this.position.copy(), this.size.copy(), this.content, this.onClick);
  }

  /**
  * 자신을 제거합니다.
  */
  destroy() {
    if (this.element) {
      this.element.removeEventListener('click', this.clickHandler);
    }
    super.destroy();
  }

  /**
  * Entity 객체를 Clickable 객체로 변환합니다.
  * @param {Entity} entity - 변환할 Entity 객체
  * @param {Function} onClick - 클릭 시 호출될 함수
  * @returns {Clickable} 새로운 Clickable 객체
  */
  static cast(entity, onClick) {
    return new Clickable(entity.position, entity.size, entity.content, onClick);
  }
}

export default Clickable;
