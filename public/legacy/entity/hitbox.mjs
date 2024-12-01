import Color from '../graphic/color.mjs';
import { Decoratable } from './data.mjs';

class Hitbox extends Decoratable {
  constructor(position, size) {
    super(position, size, Color.transparent());
  }

  updatePosition(entityPosition, offset) {
    this.position.x = entityPosition.x + offset.x;
    this.position.y = entityPosition.y + offset.y;
  }
}

export default Hitbox;