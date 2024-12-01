// 1

import { Position, Size, Color } from '../graphic/data.mjs';

/**
* DOM 요소로 변환 가능한 요소의 원형입니다.
* 좌표, 크기, 하위 요소를 가지고, 그것을 DOM으로 변환합니다.
*/
class Entity {
  /**
  * @param {Position} position 위치를 지정하는 Position 객체
  * @param {Size} size 크기를 지정하는 Size 객체
  * @param {string|Node|Color} content 배경 색, 배경 이미지 또는 하위 DOM 요소
  * @param {int} layer 레이어 순서
  */
  constructor(position, size, content, layer) {
    this.position = position;
    this.size = size;
    this.content = content;
    this.originalContent = () => content;
    this.element = null;
    this.layer = layer ?? 0;
  }

  /**
  * Entity에 해당하는 div 요소를 생성합니다.
  * @returns {HTMLElement} div 요소
  */
  render() {
    const entity = document.createElement('div');
    entity.style.position = 'absolute';
    entity.style.width = `${this.size.width}px`;
    entity.style.height = `${this.size.height}px`;
    entity.style.left = `${this.position.x}px`;
    entity.style.top = `${this.position.y}px`;
    entity.style.zIndex = this.layer;

    if (typeof this.content === 'string') {
      entity.style.backgroundImage = `url(${this.content})`;
    } else if (this.content instanceof Node) {
      entity.appendChild(this.originalContent());
    } else if (this.content instanceof Color) {
      entity.style.backgroundColor = this.content.toString();
    }

    this.element = entity;
    this.destroy = this.destroy.bind(entity);
    return entity;
  }

  /**
  * 자신의 복사본을 반환합니다.
  * @returns {Entity} 새로운 Entity 객체
  */
  copy() {
    return new Entity(this.position.copy(), this.size.copy(), this.content, this.layer);
  }

  /**
  * 자신을 제거합니다.
  */
  destroy() {
    if (this.element) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }

  /**
  * 요소의 가시성을 변경합니다.
  * @param {bool} visible 가시성
  */
  visibility(visible) {
    this.originalContent().style.visibility = visible ? "visible" : "hidden";
  }

  /**
  * 다른 Entity 객체와 겹치는지 확인합니다.
  * @param {Entity} other 비교할 Entity 객체
  * @returns {boolean} 충돌 여부
  */
  isCollide(other) {
    return !(this.position.x + this.size.width < other.position.x ||
    this.position.x > other.position.x + other.size.width ||
    this.position.y + this.size.height < other.position.y ||
    this.position.y > other.position.y + other.size.height);
  }
}

export default Entity;
