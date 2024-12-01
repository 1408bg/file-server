// 2

import Entity from './entity.mjs';
import { Color, Position, Size } from '../graphic/data.mjs';

/**
* 마우스를 통하여 잡을 수 있는 수 있는 Entity입니다.
* Entity를 잡고, 놓을 때 각각 onSelect, onDrop을 실행합니다.
*/
class Grabbable extends Entity {
  /**
  * @param {Position} position 위치를 지정하는 Position 객체
  * @param {Size} size 크기를 지정하는 Size 객체
  * @param {string|HTMLElement|Color} content 배경색, 배경 이미지 또는 하위 DOM 요소
  * @param {Function} onSelect 잡을 시 호출될 함수 (this) => void
  * @param {Function} onDrop 놓을 시 호출될 함수 (this) => void
  */
  constructor(position, size, content, onSelect, onDrop) {
    super(position, size, content);
    this.onSelect = onSelect;
    this.onDrop = onDrop;
    this.isSelected = false;
  }

  /**
  * Entity에 해당하는 div 요소를 생성하고 클릭 이벤트 리스너를 추가합니다.
  * @returns {HTMLElement} div 요소
  */
  render() {
    const entity = super.render();
    this.clickHandler = entity.addEventListener("click", (event) => {
      this.isSelected = !this.isSelected;
      if (this.isSelected && this.onSelect) {
        this.onSelect(this);
      } else if (this.onDrop) {
        this.onDrop(this);
      }
    });
    const gameElement = document.querySelector('.__rnini_root__');
    const top = gameElement.game.offset.top;
    this.mouseMoveHandler = gameElement.addEventListener("mousemove", (event) => {
      if (this.isSelected) {
        this.position.x = event.pageX - this.size.width / 2;
        this.position.y = event.pageY - this.size.height / 2 - top;
      }
    });
    return entity;
  }

  /**
  * 자신의 복사본을 반환합니다.
  * @returns {Grabbable} 새로운 Grabbable 객체
  */
  copy() {
    return new Grabbable(this.position.copy(), this.size.copy(), this.content, this.onSelect, this.onDrop);
  }

  /**
  * 자신을 제거합니다.
  */
  destroy() {
    if (this.element) {
      this.element.removeEventListener('click', this.clickHandler);
      document.querySelector('.__rnini_root__').removeEventListener('mousemove', this.mouseMoveHandler);
    }
    super.destroy();
  }

  /**
  * Entity 객체를 Grabbable 객체로 변환합니다.
  * @param {Entity} entity - 변환할 Entity 객체
  * @param {Function} onSelect 잡을 시 호출될 함수 (this) => void
  * @param {Function} onDrop 놓을 시 호출될 함수 (this) => void
  * @returns {Grabbable} 새로운 Grabbable 객체
  */
  static cast(entity, onSelect, onDrop) {
    return new Grabbable(entity.position, entity.size, entity.content, onSelect, onDrop);
  }
}

export default Grabbable;
