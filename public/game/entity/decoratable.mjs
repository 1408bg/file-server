// 2

import Entity from './entity.mjs';
import { Color, EdgeInsets, Position, Size } from '../graphic/data.mjs';

/**
* 보다 구체적인 꾸미기가 가능한 Entity입니다.
*/
class Decoratable extends Entity {
  /**
  * @param {Position} position 위치를 지정하는 Position 객체
  * @param {Size} size 크기를 지정하는 Size 객체
  * @param {string|HTMLElement|Color} content 배경색, 배경 이미지 또는 하위 DOM 요소
  * @param {number} [transition] 변환까지 걸리는 시간(ms)
  * @param {EdgeInsets} [padding]
  * @param {Position} [anchor] 앵커 포인트를 지정하는 Position 객체
  */
  constructor(position, size, content, transition = 0, padding = EdgeInsets.all(0), anchor = new Position(0, 0)) {
    super(position, size, content);
    this.transition = transition;
    this.padding = padding;
    this.styles = {};
    this.transforms = {};
    this.anchor = anchor;
    this.flip = false;
    this.setStyle('transform-origin', `${this.anchor.x * 100}% ${this.anchor.y * 100}%`);
  }

  /**
  * Entity에 해당하는 div 요소를 생성합니다.
  * @returns {HTMLElement} div 요소
  */
  render() {
    const entity = super.render();
    entity.style.transition = `all ${this.transition}ms`;
    entity.style.padding = `${this.padding.top}px ${this.padding.right}px ${this.padding.bottom}px ${this.padding.left}px`;
    
    Object.entries(this.styles).forEach(([property, value]) => {
      entity.style[property] = value;
    });

    this.updateTransform();

    return entity;
  }

  /**
  * 개별 스타일을 설정합니다.
  * @param {string} property 속성
  * @param {string} value 값
  */
  setStyle(property, value) {
    this.styles[property] = value;
  }

  /**
  * 여러 스타일을 설정합니다.
  * @param {Object} styles CSS 속성-값을 담은 객체
  */
  setStyles(styles) {
    Object.assign(this.styles, styles);
  }

  /**
  * 자신의 복사본을 반환합니다.
  * @returns {Decoratable} 새로운 Decoratable 객체
  */
  copy() {
    const temp = new Decoratable(
      this.position.copy(),
      this.size.copy(),
      this.content,
      this.transition,
      this.padding.copy(),
      this.anchor.copy()
    );
    temp.styles = {...this.styles};
    temp.transforms = {...this.transforms};
    temp.flip = this.flip;
    return temp;
  }

  /**
  * transform 속성을 설정합니다.
  * @param {string} property transform 속성 (예: 'scaleX', 'rotate', 'translate')
  * @param {string|number} value 속성값
  */
  setTransform(property, value) {
    this.transforms[property] = value;
    this.updateTransform();
  }

  /**
  * transform 속성을 제거합니다.
  * @param {string} property 제거할 transform 속성
  */
  removeTransform(property) {
    delete this.transforms[property];
    this.updateTransform();
  }

  /**
  * 저장된 transform 상태를 기반으로 transform 스타일을 업데이트합니다.
  */
  updateTransform() {
    const offsetX = this.size.width * this.anchor.x;
    const offsetY = this.size.height * this.anchor.y;
    
    let transformString = `translate(-${offsetX}px, -${offsetY}px)`;
    
    // 객체의 속성을 순회하며 transform 문자열 생성
    Object.entries(this.transforms).forEach(([property, value]) => {
      if (property === 'translate') {
        transformString += ` translate(${value})`;
      } else if (property === 'rotate') {
        transformString += ` rotate(${value}deg)`;
      } else {
        transformString += ` ${property}(${value})`;
      }
    });
    
    this.setStyle('transform', transformString);
  }

  /**
   * 객체의 좌우 반전 상태를 설정합니다.
   * @param {boolean} value 반전 여부
   */
  setFlip(value) {
    this.flip = value;
    this.setTransform('scaleX', value ? -1 : 1);
  }

  isCollide(other) {
    if (this.anchor && (this.anchor.x !== 0 || this.anchor.y !== 0)) {
      const thisDirection = this.flip ? -1 : 1;
      const thisLeft = this.position.x - (this.size.width * this.anchor.x * thisDirection);
      const thisRight = thisLeft + (this.size.width * thisDirection);
      const thisActualLeft = Math.min(thisLeft, thisRight);
      const thisActualRight = Math.max(thisLeft, thisRight);
      const thisTop = this.position.y - (this.size.height * this.anchor.y);
      const thisBottom = thisTop + this.size.height;

      if (other instanceof Decoratable && (other.anchor.x !== 0 || other.anchor.y !== 0)) {
        const otherDirection = other.flip ? -1 : 1;
        const otherLeft = other.position.x - (other.size.width * other.anchor.x * otherDirection);
        const otherRight = otherLeft + (other.size.width * otherDirection);
        const otherActualLeft = Math.min(otherLeft, otherRight);
        const otherActualRight = Math.max(otherLeft, otherRight);
        const otherTop = other.position.y - (other.size.height * other.anchor.y);
        const otherBottom = otherTop + other.size.height;

        return !(thisActualRight < otherActualLeft ||
          thisActualLeft > otherActualRight ||
          thisBottom < otherTop ||
          thisTop > otherBottom);
      } else {
        return !(thisActualRight < other.position.x ||
          thisActualLeft > other.position.x + other.size.width ||
          thisBottom < other.position.y ||
          thisTop > other.position.y + other.size.height);
      }
    }
    
    return super.isCollide(other);
  }

  /**
  * 요소의 가시성을 변경합니다.
  * @param {bool} visible 가시성
  */
  visibility(visible) {
    this.setStyle('visibility', visible ? "visible" : "hidden");
  }
}

export default Decoratable;
