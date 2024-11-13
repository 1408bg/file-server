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
    this.frames = frames;
    this.states = states;
    this.currentFrame = 0;
    this.currentState = 0;
    if (interval instanceof Number) {
      this.interval = new Duration({ milisecond: 1000 / this.interval });
    } else {
      this.interval = interval;
    }
    this.isPlaying = false;
    this.shouldStop = false;
  }

  /**
  * 애니메이션 상태를 변경합니다.
  * @param {number} state 변경할 상태 인덱스
  */
  setState(state) {
    if (state != this.currentState && state >= 0 && state < this.states) {
      this.currentState = state;
      this.updateFrame();
    }
  }

  /**
  * 애니메이션을 재생합니다.
  */
  play() {
    this.isPlaying = true;
  }

  /**
  * 애니메이션을 일시정지합니다.
  */
  pause() {
    this.isPlaying = false;
  }

  /**
  * 애니메이션을 정지하고 첫 프레임으로 되돌립니다.
  */
  stop() {
    this.isPlaying = false;
    this.shouldStop = true;
    this.currentFrame = 0;
    this.updateFrame();
  }

  /**
  * 현재 프레임에 맞게 스프라이트 위치를 업데이트합니다.
  */
  updateFrame() {
    if (this.isPlaying) {
      if (this.entity.flip) {
        this.entity.setStyle(
          'backgroundPosition',
          `-${((this.frames - 1) - this.currentFrame) * this.entity.size.width}px -${this.currentState * this.entity.size.height}px`
        );
      } else {
        this.entity.setStyle(
          'backgroundPosition',
          `-${this.currentFrame * this.entity.size.width}px -${this.currentState * this.entity.size.height}px`
        );
      }
      this.currentFrame = (this.currentFrame + 1) % this.frames;
    }
  }

  /**
  * 애니메이션 프레임을 업데이트하는 코루틴입니다.
  */
  *animate() {
    while (!this.shouldStop) {
      if (this.isPlaying) {
        this.updateFrame();
      }
      yield waitForDuration(this.interval);
    }
  }
}

export default SpriteAnimater;