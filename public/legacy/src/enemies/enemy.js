import { Sprite, Hitbox } from '../../entity/data.mjs';
import { Size, Position, Color } from '../../graphic/data.mjs';
import { Duration, waitForDuration } from '../../util/data.mjs';
import ProgressIndicator from '../../ui/progressIndicator.mjs';

class Enemy {
  constructor({
    game,
    position,
    size,
    onDead,
    spritePath,
    frames,
    states,
    hitboxPosition,
    hitboxSize,
    damage,
    maxHealth,
    attackSpeed = new Duration({milisecond: 0}),
    weight = 1,
    exp = 1,
    moveSpeed = 3
  }) {
    this.game = game;
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.onDead = onDead;
    this.isHit = false;
    this.canAttack = true;
    this.isAttack = false;
    this.hitCooldown = false;
    this.damage = damage;
    this.weight = weight;
    this.exp = exp;
    this.moveSpeed = moveSpeed;
    this.attackSpeed = attackSpeed;
    
    this.sprite = new Sprite(
      position,
      size,
      spritePath,
      frames,
      states,
      new Duration({milisecond: 100}),
      new Position(0.5, 0.7)
    );

    this.hitboxOffset = hitboxPosition;
    this.hitbox = new Hitbox(
      new Position(
        position.x + hitboxPosition.x,
        position.y + hitboxPosition.y
      ),
      hitboxSize
    );

    this.healthBar = ProgressIndicator.liner(
      new Position(position.x - 30, position.y - 40),
      new Size(60, 5),
      Color.fromHex('#440000'),
      Color.fromHex('#ff0000'),
      100,
      1
    );

    this.coroutines = {
      checkCollision: null,
      updatePositions: null,
      attack: null,
      knockback: null,
      attackAnimation: null
    };
    this.pausedState = null;

    this.initializeGameObjects();
    this.startBehavior();
  }

  initializeGameObjects() {
    this.sprite = this.game.addEntity(this.sprite);
    this.hitbox = this.game.addEntity(this.hitbox);
    this.healthBar = this.game.addEntity(this.healthBar);
    this.sprite.startAnimation();
  }

  startBehavior() {
    this.coroutines.checkCollision = this.game.startCoroutine(this.checkCollision.bind(this));
    this.coroutines.updatePositions = this.game.startCoroutine(this.updatePositions.bind(this));
    this.game.startCoroutine(this.sprite.animationLoop.bind(this.sprite));
  }

  *checkCollision() {
    while (true) {
      if (!this.hitCooldown && this.health > 0) {
        const weapon = this.game.player.weapon;
        if (weapon.isActive && this.hitbox.isCollide(weapon.hitbox)) {
          this.takeDamage(weapon.damage);
          if (!weapon.skillHitted) {
            weapon.skillHitted = true;
          }
        }
      }
      yield null;
    }
  }

  *attack() {
    this.canAttack = false;
    yield waitForDuration(new Duration({milisecond: 200}));
    if (this.isAttack) {
      this.game.player.requestDamage(this.damage);
    }
    yield waitForDuration(new Duration({milisecond: 200}));
    yield* this.attackCooldown.bind(this)();
  }

  *attackAnimation() {
    this.isAttack = true;
    yield* this.sprite.animation(1);
    this.isAttack = false;
    this.sprite.animater.set(1, 0);
  }

  *updatePositions() {
    const playerSprite = this.game.player.sprite;
    while (true) {
      const scaleX = this.sprite.transforms.scaleX || 1;
      const minDistance = Math.pow(playerSprite.size.width / 2, 2);
      
      if (this.health > 0) {
        const playerPos = playerSprite.position;
        const enemyPos = this.sprite.position;
        const isCollide = 10 > Math.abs(playerPos.x - enemyPos.x);
        const direction = playerPos.x > enemyPos.x ? 1 : -1;
        
        const distance = enemyPos.distance(playerPos);
        
        if (distance > minDistance && !isCollide) {
          this.sprite.setState(0);
          this.sprite.position.x += direction * this.moveSpeed;
          this.sprite.setTransform('scaleX', direction);
        } else if (this.canAttack && distance < minDistance) {
          this.coroutines.attack = this.game.startCoroutine(this.attack.bind(this));
          this.coroutines.attackAnimation = this.game.startCoroutine(this.attackAnimation.bind(this));
        }
      }

      this.hitbox.updatePosition(this.sprite.position, this.hitboxOffset);

      this.healthBar.position.x = this.sprite.position.x - this.sprite.size.width * 0.25;
      this.healthBar.position.y = this.sprite.position.y - this.sprite.size.height * 0.6;
      
      yield null;
    }
  }

  *knockback() {
    const knockbackDirection = this.sprite.position.x > this.game.player.sprite.position.x ? 1 : -1;
    const dashForce = 10*this.game.player.weapon.force - this.weight;
    const friction = 0.4;
    let velocity = dashForce * knockbackDirection;
    
    this.sprite.animater.set(0, 0);
    while (true) {
      this.sprite.position.x += velocity;
      velocity = velocity > 0
        ? Math.max(0, velocity - friction)
        : Math.min(0, velocity + friction);
      
      if (velocity === 0) {
        break;
      }
      
      yield null;
    }
  }

  *attackCooldown() {
    yield waitForDuration(this.attackSpeed);
    this.canAttack = true;
  }

  *hitAnimation() {
    this.sprite.setStyle('opacity', '0.5');
    yield waitForDuration(new Duration({milisecond: 500}));
    this.sprite.setStyle('opacity', '1');
    this.hitCooldown = false;
  }
  
  takeDamage(damage) {
    if (this.hitCooldown || this.health <= 0) return;
    if (this.coroutines.attack) {
      this.game.stopCoroutine(this.coroutines.attack);
      this.game.stopCoroutine(this.coroutines.attackAnimation);
      this.game.startCoroutine(this.attackCooldown.bind(this));
      this.coroutines.attack = null;
      this.coroutines.attackAnimation = null;
    }
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy();
      return;
    }
    this.healthBar.setValue(this.health / this.maxHealth * 100);
    this.hitCooldown = true;
    this.coroutines.knockback = this.game.startCoroutine(this.knockback.bind(this));
    this.coroutines.hitAnimation = this.game.startCoroutine(this.hitAnimation.bind(this));
  }

  destroy() {
    this.onDead(this);
    this.game.player.addExp(this.exp);
    this.game.removeEntity(this.sprite);
    this.game.removeEntity(this.hitbox);
    this.game.removeEntity(this.healthBar);
  }

  pause() {
    this.pausedState = {
      isHit: false,
      canAttack: true,
      hitCooldown: false,
      health: this.health,
      position: { 
        x: this.sprite.position.x, 
        y: this.sprite.position.y 
      },
      state: 0,
      coroutines: { ...this.coroutines }
    };

    for (const key in this.coroutines) {
      this.game.stopCoroutine(this.coroutines[key]);
      this.coroutines[key] = null;
    }
    this.sprite.setStyle('opacity', '1');

    this.sprite.stopAnimation();
    this.hitbox.visibility(false);
    this.healthBar.visibility(false);
  }

  resume() {
    if (!this.pausedState) return;

    this.isHit = this.pausedState.isHit;
    this.canAttack = this.pausedState.canAttack;
    this.hitCooldown = this.pausedState.hitCooldown;
    this.health = this.pausedState.health;
    
    this.sprite.position.x = this.pausedState.position.x;
    this.sprite.position.y = this.pausedState.position.y;
    this.sprite.setState(this.pausedState.state);

    this.hitbox.visibility(true);
    this.healthBar.visibility(true);

    this.startBehavior();
    this.sprite.startAnimation();

    this.pausedState = null;
  }
}

export default Enemy;