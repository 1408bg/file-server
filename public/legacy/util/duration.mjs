// 0

/**
* 시간을 나타내는 클래스입니다.
* 각 단위별로 시간을 초기화할 수 있습니다.
*/
class Duration {
  constructor({ milisecond = 0, second = 0, minute = 0, hour = 0, day = 0 }) {
    this.value = milisecond 
    + second * 1000
    + minute * 60 * 1000
    + hour * 60 * 60 * 1000
    + day * 24 * 60 * 60 * 1000;
  }
}

export default Duration;