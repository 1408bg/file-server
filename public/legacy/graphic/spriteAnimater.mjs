// 3

import Decoratable from "../entity/decoratable.mjs";
import Duration from "../util/duration.mjs";
import waitForDuration from "../util/coroutine.mjs";

/**
* 스프라이트 시트 기반 애니메이션을 관리하는 클래스입니다.
* 가로 방향으로는 프레임을, 세로 방향으로는 상태를 나타냅니다.
*/
class SpriteAnimater {
  /**
  * @param {Decoratable} entity 애니메이션을 적용할 엔티티
  * @param {number} frames 프레임 개수
  * @param {number} states 상태 개수
  * @param {number|Duration} [interval] fps / 기간 객체
  */
  constructor(entity, frames, states, interval = 24) {
    this.entity = entity;
    this.isPlaying = false;
    this.frames = frames;
    this.states = states;
    if (interval instanceof Number) {
      this.interval = new Duration({ milisecond: 1000 / this.interval });
    } else {
      this.interval = interval;
    }
  }

  start() {
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
  }

  set(state, frame) {
    if (this.entity.flip) {
      this.entity.setStyle(
        'backgroundPosition',
        `-${((this.frames - 1) - frame) * this.entity.size.width}px -${state * this.entity.size.height}px`
      );
    } else {
      this.entity.setStyle(
        'backgroundPosition',
        `-${frame * this.entity.size.width}px -${state * this.entity.size.height}px`
      );
    }
  }
  
  *animate(state) {
    for (let i = 0; i < this.frames && this.isPlaying; i++) {
      this.set(state, i);
      yield waitForDuration(this.interval);
    }
  }
}

export default SpriteAnimater;