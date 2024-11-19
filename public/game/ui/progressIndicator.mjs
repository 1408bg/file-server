// 2

import Entity from "../entity/entity.mjs";
import Color from "../graphic/color.mjs";
import Position from "../graphic/position.mjs";
import Size from "../graphic/size.mjs";

class ProgressIndicator extends Entity {
  /**
  * 
  * @param {Position} position 위치
  * @param {Size} size 크기
  * @param {HTMLElement} body 요소
  * @param {number} value 진행도 (0~100)
  */
  constructor(position, size, body, value, type) {
    super(position, size, body, 10);
    this.value = value;
    this.type = type;
  }

  /**
  * 선형 ProgressIndicator를 반환합니다.
  * @param {Position} position 위치
  * @param {Size} size 크기
  * @param {Color} backgroundColor 배경 색
  * @param {Color} progressColor 진행 막대 색
  * @param {number} [value] 진행도 (0~100)
  * @param {number} [duration] 변경 속도
  * @param {boolean} [isVertical] 세로로 표시할지 여부
  * @returns {ProgressIndicator} LinerProgressIndicator
  */
  static liner(position, size, backgroundColor, progressColor, value = 0, duration = 0, isVertical = false) {
    const content = document.createElement("div");
    content.style.width = `${size.width}px`;
    content.style.height = `${size.height}px`;
    content.style.backgroundColor = backgroundColor.toString();
    
    const line = document.createElement("div");
    if (isVertical) {
      line.style.height = `${value}%`;
      line.style.width = `${size.width}px`;
    } else {
      line.style.width = `${value}%`;
      line.style.height = `${size.height}px`;
    }
    line.style.transition = `width ${duration}s, height ${duration}s`;
    line.style.backgroundColor = progressColor.toString();
    line.style.zIndex = "11";
    content.appendChild(line);
    return new ProgressIndicator(
      position,
      size,
      content,
      value,
      isVertical ? 'vertical' : 'horizontal'
    );
  }

  /**
  * 원형 ProgressIndicator를 반환합니다.
  * @param {Position} position 위치
  * @param {Size} size 크기
  * @param {Color} backgroundColor 배경 색
  * @param {Color} progressColor 진행 막대 색
  * @param {number} [value] 진행도 (0~100)
  * @param {number} [duration] 변경 속도
  * @returns {ProgressIndicator} CircularProgressIndicator
  */
  static circular(position, size, backgroundColor, progressColor, value = 0, duration = 0) {
    const content = document.createElement("div");
    content.style.width = `${size.width}px`;
    content.style.height = `${size.height}px`;
    content.style.backgroundColor = backgroundColor.toString();
    content.style.borderRadius = "50%";
    content.style.position = "relative";
    content.style.overflow = "hidden";

    const circle = document.createElement("div");
    circle.style.width = "100%";
    circle.style.height = "100%";
    circle.style.position = "absolute";
    circle.style.transition = `transform ${duration}s`;
    circle.style.backgroundColor = progressColor.toString();
    circle.style.transformOrigin = "50% 50%";
    circle.style.transform = `rotate(${(value / 100) * 360}deg)`;
    circle.style.clipPath = "polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)";
    circle.style.zIndex = "11";

    const mask = document.createElement("div");
    mask.style.width = "100%";
    mask.style.height = "100%";
    mask.style.position = "absolute";
    mask.style.backgroundColor = backgroundColor.toString();
    mask.style.clipPath = "polygon(50% 50%, 100% 50%, 100% 100%, 0 100%, 0 0, 100% 0, 100% 50%)";
    mask.style.transform = `rotate(${(value / 100) * 360}deg)`;
    mask.style.transition = `transform ${duration}s`;
    mask.style.zIndex = "12";

    content.appendChild(circle);
    content.appendChild(mask);
    
    return new ProgressIndicator(
      position,
      size,
      content,
      value,
      'circular'
    );
  }

  /**
  * 진행도를 변경합니다.
  * @param {number} value 진행도 (0~100)
  */
  setValue(value) {
    value = value > 100 ? 100 : value;
    const content = this.originalContent();
    if (content.children.length === 1) {
      if (this.type === 'vertical') {
        content.children[0].style.height = `${value}%`;
      } else {
        content.children[0].style.width = `${value}%`;
      }
    } else {
      const rotation = (value / 100) * 360;
      content.children[0].style.transform = `rotate(${rotation}deg)`;
      content.children[1].style.transform = `rotate(${rotation}deg)`;
    }
  }

  /**
  * 배경 색을 변경합니다.
  * @param {Color} color 배경 색
  */
  setBackgroundColor(color) {
    this.originalContent().style.backgroundColor = color.toString();
  }

  /**
  * 진행 막대 색을 변경합니다.
  * @param {Color} color 진행 막대 색
  */
  setProgressColor(color) {
    this.originalContent().children[0].style.backgroundColor = color.toString();
  }
}

export default ProgressIndicator;
