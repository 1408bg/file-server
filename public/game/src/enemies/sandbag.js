import { Size, Position } from '../../graphic/data.mjs';
import Duration from '../../util/duration.mjs';
import Enemy from './enemy.js';

class Sandbag extends Enemy {
  constructor({ game, position, onDead, damage, health, weight = 1, factor = 1, moveSpeed = 3, exp = 1 }) {
    super({
      game,
      position,
      size: new Size(120, 200).scale(factor),
      onDead,
      spritePath: './assets/sandbag-sheet.png',
      frames: 4,
      states: 2,
      hitboxPosition: new Position(-30, -100*factor),
      hitboxSize: new Size(60, 120).scale(factor),
      damage,
      maxHealth: health,
      attackSpeed: new Duration({milisecond: 500}),
      weight,
      exp,
      moveSpeed
    });
  }
}

export default Sandbag; 