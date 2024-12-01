// 1

import Duration from "../util/duration.mjs";

/**
* 일정 시간동안 특정 값에 Lerp를 적용하여 함수를 실행합니다.
* @param {float} start 시작 값
* @param {float} end 종료 값
* @param {Function} lerpFunc Lerp클래스의 lerp함수
* @param {Duration} duration 시간
* @param {Function} callback 현재 값을 받을 함수
* @param {Function} [onFinished] 모든 작업이 완료되었을 때 호출될 함수
* @returns {Function} 애니메이션을 중단하는 stop 함수
*/
function animate(start, end, lerpFunc, duration, callback, onFinished) {
  let startTime = null;
  let playing = true;
  const d = duration.value;

  function stop() {
    playing = false;
  }

  function animationFrame(time) {
    if (!startTime) startTime = time;
    let elapsed = time - startTime;

    let t = Math.min(elapsed / d, 1);
    let currentValue = lerpFunc(start, end, t);

    callback(currentValue);

    if (t < 1 && playing) {
      requestAnimationFrame(animationFrame);
    } else if (t >= 1 && playing && onFinished) {
      onFinished();
    }
  }

  requestAnimationFrame(animationFrame);

  return stop;
}

export default animate;
