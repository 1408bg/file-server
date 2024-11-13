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
    this.animation = new SpriteAnimater(this, frames, states, interval);
    this.animationCoroutine = null;
    this.setStyle('background-size', `${this.size.width*this.animation.frames}px ${this.size.height*this.animation.states}px`);
  }

  /**
  * 애니메이션 상태를 변경합니다.
  * @param {int} state 변경할 상태 인덱스
  */
  setState(state) {
    this.animation.setState(state);
  }

  /**
  * 애니메이션을 재생합니다.
  */
  play() {
    this.animation.play();
  }

  /**
  * 애니메이션을 일시정지합니다.
  */
  pause() {
    this.animation.pause();
  }

  /**
  * 애니메이션을 정지하고 첫 프레임으로 되돌립니다.
  */
  stop() {
    this.animation.stop();
  }

  /**
  * 애니메이션 코루틴을 시작합니다.
  * @param {Game} game 게임 인스턴스
  */
  startAnimation(game) {
    if (this.game && this.animationCoroutine) {
      this.game.stopCoroutine(this.animationCoroutine);
    }
    this.game = game;
    this.animationCoroutine = game.startCoroutine(this.animation.animate.bind(this.animation));
  }

  destroy() {
    if (this.game && this.animationCoroutine) {
      this.game.stopCoroutine(this.animationCoroutine);
      this.animationCoroutine = null;
    }
    if (this.animation) {
      this.animation.stop();
      this.animation = null;
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
    super.destroy();
  }
}

export default Sprite;