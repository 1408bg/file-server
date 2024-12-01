// 4

import SpriteAnimater from "../graphic/spriteAnimater.mjs";
import Duration from "../util/duration.mjs";
import Decoratable from "./decoratable.mjs";
import Position from "../graphic/position.mjs";

/**
* 스프라이트 시트 기반 애니메이션이 가능한 Entity입니다.
* x축에 프레임, y축에 상태를 담는 시트를 필요로 합니다.
*/
class Sprite extends Decoratable {
  /**
  * @param {Position} position 위치를 지정하는 Position 객체
  * @param {Size} size 크기를 지정하는 Size 객체
  * @param {string} spriteSheet 스프라이트 시트 이미지 경로
  * @param {int|Duration} frames 프레임 개수
  * @param {int} states 상태 개수
  * @param {int|Duration} interval fps / 기간 객체
  * @param {Position} [anchor] 앵커포인트 (0,0)은 좌상단, (1,1)은 우하단
  */
  constructor(position, size, spriteSheet, frames, states, interval, anchor = new Position(0, 0)) {
    super(position, size, spriteSheet, 0, undefined, anchor);
    this.animater = new SpriteAnimater(this, frames, states, interval);
    this.shift = false;
    this.animationCoroutine = null;
    this.currentState = 0;
    this.setStyle('background-size', `${this.size.width*this.animater.frames}px ${this.size.height*this.animater.states}px`);
  }

  startAnimation() {
    this.animater.start();
  }

  stopAnimation() {
    this.animater.stop();
  }

  setState(state) {
    this.currentState = state;
  }

  *animation(state) {
    this.shift = true;
    yield* this.animater.animate(state);
    this.shift = false;
  }
  
  *animationLoop() {
    while (true) {
      yield null;
      if (this.shift) continue;
      yield* this.animater.animate(this.currentState);
    }
  }
}

export default Sprite;