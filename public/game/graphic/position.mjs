// 0

/**
* 2차원 좌표를 나타내는 클래스입니다. 
* 좌표 (x, y)를 기반으로 위치를 설정하고, 이동하거나 두 좌표 사이의 거리 및 각도를 계산할 수 있습니다.
*/
class Position {
  /**
  * 2차원 위치를 지정합니다.
  * @param {number} x x 좌표
  * @param {number} y y 좌표
  */
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }

  /**
  * 현재 위치의 복사본을 반환합니다.
  * @returns {Position} 새로운 위치 객체
  */
  copy() {
    return new Position(this.x, this.y);
  }

  /**
  * position만큼 자신의 위치를 변경합니다.
  * @param {Position} position
  * @returns {Position}
  */
  move(position) {
    this.x += position.x;
    this.y += position.y;
    return this;
  }

  /**
  * 자신의 위치를 position으로 변경합니다.
  * @param {Position} position
  * @returns {Position}
  */
  set(position) {
    this.x = position.x;
    this.y = position.y;
    return this;
  }

  /**
  * position과 자신의 위치 사이의 거리 제곱을 반환합니다.
  * @param {Position} position
  * @returns {float} 거리
  */
  distance(position) {
    return (this.x - position.x) ** 2 + (this.y - position.y) ** 2
  }

  /**
  * 두 위치가 동일한지 확인합니다.
  * @param {Position} position
  * @returns {boolean} 동일 여부
  */
  equals(position) {
    return this.x === position.x && this.y === position.y;
  }

  /**
  * 두 위치 사이의 각도를 반환합니다.
  * @param {Position} position
  * @returns {float} 라디안 단위의 각도
  */
  angle(position) {
    return Math.atan2(position.y - this.y, position.x - this.x);
  }
}

export default Position;