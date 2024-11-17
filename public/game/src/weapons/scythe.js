import { Size, Position } from '../../graphic/data.mjs';
import { Duration } from '../../util/data.mjs';
import waitForDuration from '../../util/coroutine.mjs';
import Weapon from './weapon.js';

class Scythe extends Weapon {
  constructor(position) {
    super(
      position,
      new Size(160, 160),
      './assets/weapon.png',
      new Position(0, -65),
      new Size(120, 160),
      10,
      new Position(0.25, 0.4),
      new Duration({second: 1})
    );
  }

  *attackAnimation() {
    this.activate();
    let step = 0;
    while(step < 135) {
      this.setTransform('rotate', -step);
      step += 9;
      yield null;
    }
    yield waitForDuration(new Duration({milisecond: 150}));
    this.removeTransform('rotate');
    this.deactivate();
  }

  *skill(player, direction) {
    this.setForce(1.6);
    this.skillHitted = false;
    const dashForce = 80;
    const friction = 4;
    let step = 0;
    this.activate();
    let velocity = dashForce * direction;
    while (true) {
      this.setTransform('rotate', -step);
      step += 4;
      this.setPosition({x: this.position.x + velocity});
      velocity = velocity > 0
        ? Math.max(0, velocity - friction)
        : Math.min(0, velocity + friction);
      
      if (velocity === 0 || this.skillHitted) {
        break;
      }
      
      yield null;
    }
    velocity = 1;
    const invert = direction == 1;
    while (invert ? this.position.x > player.position.x : this.position.x < player.position.x) {
      this.setPosition({x: this.position.x + velocity});
      this.setTransform('rotate', -step);
      step += 4;
      velocity = invert
        ? velocity - friction
        : velocity + friction

      yield null;
    }
    this.setTransform('rotate', 0);
    this.deactivate();
    this.setForce(1);
  }
}

export default Scythe; 