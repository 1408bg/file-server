// 1

import Duration from "./duration.mjs";

/**
* 제너레이터 형식의 코루틴을 관리하는 Class입니다.
* startCoroutine으로 코루틴을 추가하고, stopCoroutine으로 코루틴을 제거합니다.
*/
class CoroutineManager {
  constructor() {
    this.coroutines = new Set();
  }

  /**
  * 제너레이터를 받아 코루틴을 시작합니다.
  * 반환된 함수는 나중에 stopCoroutine을 호출하여 중지할 수 있습니다.
  * @param {GeneratorFunction} generator 실행할 제너레이터(코루틴)
  * @returns {Function} 중지할 때 사용할 process
  */ 
  startCoroutine(generator) {
    const iterator = generator();

    const process = () => {
      const { value, done } = iterator.next();

      if (done) {
        this.coroutines.delete(process);
        return;
      }

      if (value === null) {
        requestAnimationFrame(() => {
          if (this.coroutines.has(process)) process();
        });
      }
      else if (value instanceof Promise) {
        value.then(() => {
          if (this.coroutines.has(process)) process();
        });
      } else {
        process();
      }
    };

    this.coroutines.add(process);
    process();

    return process;
  }

  /**
  * 실행 중인 코루틴을 중지합니다.
  * @param {Function} process startCoroutine이 반환한 process
  */
  stopCoroutine(process) {
    this.coroutines.delete(process);
  }
}

/**
* 특정 기간 대기를 지시하는 객체를 반환합니다.
* @param {Duration} duration 대기 기간
*/
function waitForDuration(duration) {
  return new Promise(
    resolve => {
      const end = new Date().getTime() + duration.value;
      const check = () => {
        requestAnimationFrame(()=>{
          if (new Date().getTime() >= end) resolve();
          else check();
        });
      };
      check();
    }
  )
}

export { CoroutineManager };
export default waitForDuration;