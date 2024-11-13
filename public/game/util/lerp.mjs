// 0

/**
* 러프 함수를 제공하는 클래스입니다.
* 인자로 시작 값, 종료 값, 진행도를 받습니다.
*/
class Lerp {  
  static lerp(start, end, t) {
    return start + (end - start) * t;
  }

  static easeInSine(start, end, t) {
    return start + (end - start) * (1 - Math.cos((t * Math.PI) / 2));
  }

  static easeOutSine(start, end, t) {
    return start + (end - start) * Math.sin((t * Math.PI) / 2);
  }

  static easeInOutSine(start, end, t) {
    return start + (end - start) * (-(Math.cos(Math.PI * t) - 1) / 2);
  }

  static easeInQuad(start, end, t) {
    return start + (end - start) * t * t;
  }

  static easeOutQuad(start, end, t) {
    return start + (end - start) * (1 - (1 - t) * (1 - t));
  }

  static easeInOutQuad(start, end, t) {
    return t < 0.5
    ? start + (end - start) * (2 * t * t)
    : start + (end - start) * (1 - Math.pow(-2 * t + 2, 2) / 2);
  }
}

export default Lerp;