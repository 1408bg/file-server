import { Decoratable } from '../../entity/data.mjs';
import { Position, Color } from '../../graphic/data.mjs';

class Weapon extends Decoratable {
  constructor(position, size, imagePath, hitboxPosition, hitboxSize, damage, anchor, skillCooldown) {
    super(position, size, imagePath, 0, undefined, anchor);
    this.layer = 11;
    this.damage = damage;
    this.skillCooldown = skillCooldown;

    this.hitboxOffset = hitboxPosition;
    this.hitbox = new Decoratable(
      new Position(
        position.x + hitboxPosition.x,
        position.y + hitboxPosition.y
      ),
      hitboxSize,
      Color.transparent()
    );

    this.isActive = false;
    this.skillHitted = false;
    this.force = 1;
  }

  render() {
    const entity = super.render();
    this.updateHitboxPosition();
    return entity;
  }

  updateHitboxPosition() {
    const direction = this.flip ? -1 : 1;
    const weaponCenter = this.position.x - (this.size.width * this.anchor.x);
    this.hitbox.position.x = weaponCenter + this.hitbox.size.width * direction;
    this.hitbox.position.y = this.position.y + this.hitboxOffset.y;
  }

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  setForce(force) {
    this.force = force;
  }

  setPosition({x, y}) {
    if (x) {
      this.position.x = x;
    }
    if (y) {
      this.position.y = y;
    }
    this.updateHitboxPosition();
  }

  destroy() {
    if (this.hitbox) {
      this.hitbox.destroy();
      this.hitbox = null;
    }
    super.destroy();
  }

  *attackAnimation() {
    throw new Error('attackAnimation must be implemented');
  }

  setFlip(value) {
    super.setFlip(value);
    this.updateHitboxPosition();
  }

  pause() {
    this.removeTransform('rotate');
    this.pausedState = {
      isActive: this.false,
      transforms: {...this.transforms}
    };
    this.isActive = false;
  }

  resume() {
    if (!this.pausedState) return;
    
    this.isActive = this.pausedState.isActive;
    this.transforms = {...this.pausedState.transforms};
    this.updateTransform();
    
    this.pausedState = null;
  }

  startCoroutine(generator) {
    return this.coroutineManager.startCoroutine(generator);
  }
}

export default Weapon; 