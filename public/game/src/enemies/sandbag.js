import { Size, Position } from '../../graphic/data.mjs';
import Duration from '../../util/duration.mjs';
import Enemy from './enemy.js';

class Sandbag extends Enemy {
  constructor(game, position, onDead, damage, health, weight = 1, factor = 1, moveSpeed = 3, exp = 1) {
    super(
      game,
      position,
      new Size(120, 200).scale(factor),
      onDead,
      './assets/sandbag-sheet.png',
      4,
      2,
      new Position(-30, -70),
      new Size(60, 120).scale(factor),
      damage,
      health,
      new Duration({milisecond: 500}),
      weight,
      exp,
      moveSpeed
    );
  }
}

export default Sandbag; 