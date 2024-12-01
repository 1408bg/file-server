// 0

/**
* 2차원 크기를 나타내는 클래스입니다. 
* width, height를 기반으로 크기를 설정합니다.
*/
class Size {
  /**
  * 2차원 크기를 지정합니다.
  * @param {number} width 가로 길이
  * @param {number} height 세로 길이
  */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.size = width * height;
  }

  /**
  * 요소에 맞춘 크기를 반환합니다.
  * @param {HTMLElement} element 크기의 기준이 될 요소
  * @returns {Size}
  */
  static fitOf(element) {
    const target = element.cloneNode(true);
    target.style.visibility = 'hidden';
    target.style.position = 'absolute';
    target.style.left = '-9999px';
    target.style.whiteSpace = 'nowrap';
    target.style.display = 'inline-block';
    
    document.body.appendChild(target);
    const size = {
      width: target.getBoundingClientRect().width,
      height: target.getBoundingClientRect().height
    };
    document.body.removeChild(target);
    return new Size(
      Math.ceil(size.width),
      Math.ceil(size.height)
    );
  }

  /**
  * 현재 크기의 복사본을 반환합니다.
  * @returns {Size} 새로운 크기 객체
  */
  copy() {
    return new Size(this.width, this.height);
  }

  /**
  * 자신이 size를 포함할 수 있는지 확인합니다.
  * @param {Size} size
  * @returns {boolean} 포함 여부
  */
  contains(size) {
    return (this.width >= size.width) && (this.height >= size.height);
  }

  /**
  * 두 크기가 동일한지 확인합니다.
  * @param {Size} size
  * @returns {boolean} 동일 여부
  */
  equals(position) {
    return this.width === position.width && this.height === position.height;
  }

  /**
  * 크기를 입력된 배율로 확대하거나 축소합니다.
  * @param {number} factor 배율
  * @returns {Size}
  */
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.size = this.width * this.height;
    return this;
  }

  /**
  * 크기를 가로, 세로 각각 주어진 값만큼 증가시킵니다.
  * @param {number} widthIncrement 가로 증가 값
  * @param {number} heightIncrement 세로 증가 값
  */
  increase(widthIncrement, heightIncrement) {
    this.width += widthIncrement;
    this.height += heightIncrement;
    this.size = this.width * this.height;
  }
}

export default Size;