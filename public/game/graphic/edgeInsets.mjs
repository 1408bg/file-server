// 0

/**
* 2차원 부피를 나타내는 클래스입니다.
* LTRB로 방향별 부피를 저장합니다.
*/
class EdgeInsets {
  /**
  * 2차원 부피를 지정합니다.
  * @param {float} left
  * @param {float} top
  * @param {float} right
  * @param {float} bottom
  */
  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  static fromLTRB({left, top, right, bottom}) {
    return new EdgeInsets(left, top, right, bottom);
  }

  static symmetric({vertical, horizontal}) {
    return new EdgeInsets(horizontal, vertical, horizontal, vertical);
  }

  static all(value) {
    return new EdgeInsets(value, value, value, value);
  }

  /**
  * 현재 크기의 복사본을 반환합니다.
  * @returns {EdgeInsets} 새로운 크기 객체
  */
  copy() {
    return new EdgeInsets(this.left, this.top, this.right, this.bottom);
  }

  /**
  * 두 크기가 동일한지 확인합니다.
  * @param {EdgeInsets} edgeInsets
  * @returns {boolean} 동일 여부
  */
  equals(edgeInsets) {
    return this.left === edgeInsets.left
    && this.top === edgeInsets.top
    && this.right === edgeInsets.right
    && this.bottom === edgeInsets.bottom;
  }
}

export default EdgeInsets;