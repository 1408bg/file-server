// 0

/**
* 색상을 나타내는 클래스입니다.
* 여러 메서드를 통하여 rgba 기반의 색상을 저장합니다.
*/
class Color {
  /**
  * @param {int} r red (0~255)
  * @param {int} g green (0~255)
  * @param {int} b blue (0~255)
  * @param {float} a alpha (0.0~1.0)
  */
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
  * 불투명한 색상을 생성합니다.
  * @param {int} r red (0~255)
  * @param {int} g green (0~255)
  * @param {int} b blue (0~255)
  * @returns {Color} 색상
  */
  static fromRGB(r, g, b) {
    return new Color(r, g, b, 1);
  }

  /**
  * 16진수 색상을 기반으로 색상을 생성합니다.
  * @param {string} hex 16진수 형식의 색상 코드 (#RRGGBB 또는 #RRGGBBAA)
  * @returns {Color} 색상
  */
  static fromHex(hex) {
    hex = hex.replace('#', '');

    let r, g, b, a = 1;

    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
      throw new Error('Invalid hex color format');
    }

    return new Color(r, g, b, a);
  }

  static transparent() {
    return new Color(0, 0, 0, 0);
  }

  /**
  * 자신의 복사본을 반환합니다.
  * @returns {Color} 새로운 Color 객체
  */
  copy() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  /**
  * 두 크기가 동일한지 확인합니다.
  * @param {Color} color
  * @returns {boolean} 동일 여부
  */
  equals(color) {
    return this.r === color.r
    && this.g === color.g
    && this.b === color.b
    && this.a === color.a;
  }

  /**
  * 색상을 문자열로 반환합니다.
  * @returns {string} rgba() 형식의 색상 문자열
  */
  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}

export default Color;