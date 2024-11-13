import { Sprite } from '../entity/data.mjs';
import { Size, Position, Color } from '../graphic/data.mjs';
import { ProgressIndicator } from '../ui/data.mjs';
import { Duration, waitForDuration } from '../util/data.mjs';
import Scythe from './weapons/scythe.js';

class Player {
  constructor(game, position, groundHeight, onDead, onLevelUp) {
    this.game = game;
    this.onDead = onDead;
    this.onLevelUp = onLevelUp;
    this.game.player = this;
    this.keys = [false, false];
    this.canDash = true;
    this.canAttack = true;
    this.canWeaponSkill = false;
    this.canWeaponMove = true;
    this.lastDirection = 1;
    this.verticalVelocity = 0;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.exp = 0;
    this.level = 0;
    this.currentFloor = null;
    this.levelUpQueue = [];
    this.isProcessingLevelUp = false;
    this.moveSpeed = 4;
    
    this.sprite = new Sprite(
      position,
      new Size(160, 160),
      './assets/sheet.png',
      4,
      2,
      new Duration({milisecond: 200}),
      new Position(0.5, 0.8)
    );
    this.sprite.layer = 20;

    this.weapon = new Scythe(new Position(position.x, position.y));

    this.healthBar = ProgressIndicator.liner(
      new Position(this.game.width/2 - this.game.width*0.4, this.game.height - 100),
      new Size(this.game.width*0.8, 50),
      Color.fromHex('#440000'),
      Color.fromHex('#ff0000'),
      100,
      0.3
    );

    this.expBar = ProgressIndicator.liner(
      new Position(this.game.width/2 - this.game.width*0.4, this.game.height - 100),
      new Size(this.game.width*0.8, 20),
      Color.fromHex('#226622'),
      Color.fromHex('#00ff00'),
      0,
      0.3
    )

    this.GRAVITY = 0.6;
    this.MAX_VELOCITY = 16;
    this.groundHeight = groundHeight;

    this.coroutines = {
      movePlayer: null,
      moveWeapon: null,
      applyGravity: null,
      dash: null,
      attack: null
    };
    this.pausedState = null;

    this.keyboardEventListener = null;
    this.setupKeyboardControls();
    this.initializeGameObjects();
  }

  setupKeyboardControls() {
    this.keyboardEventListener = this.game.addKeyboardEventListener((type, event) => {
      if (type === 'keydown') {
        if (event.key === 'ArrowLeft') {
          this.keys[0] = true;
          this.lastDirection = -1;
        } else if (event.key === 'ArrowRight') {
          this.keys[1] = true;
          this.lastDirection = 1;
        } else if (this.checkGround() && event.key === 'c') {
          this.verticalVelocity -= 15;
        } else if (this.canDash && event.key === 'z') {
          this.coroutines.dash = this.game.startCoroutine(this.dashPlayer.bind(this));
        } else if (this.canAttack && event.key === 'x') {
          this.coroutines.attack = this.game.startCoroutine(this.attack.bind(this));
        } else if (this.canWeaponSkill && event.key === 'a') {
          this.game.startCoroutine(this.weaponSkill.bind(this));
        }
      } else if (type === 'keyup') {
        if (event.key === 'ArrowLeft') {
          this.keys[0] = false;
          if (this.keys[1]) {
            this.lastDirection = 1;
          }
        } if (event.key === 'ArrowRight') {
          this.keys[1] = false;
          if (this.keys[0]) {
            this.lastDirection = -1;
          }
        }
      }
    });
  }

  initializeGameObjects() {
    this.game.addEntity(this.sprite);
    this.game.addEntity(this.weapon);
    this.game.addEntity(this.weapon.hitbox);
    this.game.addEntity(this.healthBar);
    this.game.addEntity(this.expBar);
    this.sprite.startAnimation(this.game);
    
    this.coroutines.movePlayer = this.game.startCoroutine(this.movePlayer.bind(this));
    this.coroutines.moveWeapon = this.game.startCoroutine(this.moveWeapon.bind(this));
    this.coroutines.applyGravity = this.game.startCoroutine(this.applyGravity.bind(this));
    
    this.sprite.play();
  }

  *movePlayer() {
    while (1) {
      if (this.canDash && (this.keys[0] || this.keys[1]) && !(this.keys[0] && this.keys[1])) {
        this.sprite.setState(1);
        const direction = this.keys[1] ? 1 : -1;
        this.sprite.position.x += direction * this.moveSpeed;
      } else {
        this.sprite.setState(0);
      }
      this.sprite.setTransform('scaleX', this.lastDirection);
      yield null;
    }
  }

  *weaponSkill() {
    this.canWeaponMove = false;
    this.canWeaponSkill = false;
    this.canAttack = false;
    yield* this.weapon.skill(this.sprite, this.lastDirection);
    yield waitForDuration(new Duration({second: 3}));
    this.canAttack = true;
    this.canWeaponSkill = true;
    this.canWeaponMove = true;
  }

  *moveWeapon() {
    while (1) {
      if (this.canWeaponMove) {
        const direction = this.lastDirection === -1;
        const weaponX = this.sprite.position.x - (this.sprite.size.width * (this.sprite.anchor.x-this.weapon.anchor.x)) * (direction ? -1 : 1);
        const weaponY = this.sprite.position.y - this.sprite.size.height * (this.sprite.anchor.y-this.weapon.anchor.y);
        
        this.weapon.setFlip(direction);
        this.weapon.setPosition({x: weaponX, y: weaponY});
      }
      yield null;
    }
  }

  checkGround() {
    let isGrounded = false;
    this.game.groundPrefab.instantiatedEntities.forEach(e => {
      if (this.sprite.isCollide(e) && this.sprite.position.y < e.position.y) {
        if (this.verticalVelocity >= 0) {
          isGrounded = true;
          this.currentFloor = e.position.y;
          this.verticalVelocity = 0;
        }
      }
    });
    return isGrounded;
  }

  addHealth(value) {
    this.health += value;
    this.health = Math.min(this.health, this.maxHealth);
    if (this.health <= 0) {
      this.onDead();
    }
    this.healthBar.setValue(this.health/this.maxHealth*100);
  }

  requestDamage(value) {
    this.addHealth(-value);
  }

  getRequiredExp() {
    return ((this.level+1) * 50 / 49) * 2.5;
  }

  addExp(value) {
    this.exp += value;
    if (this.exp >= this.getRequiredExp()) {
      this.exp -= this.getRequiredExp();
      this.levelUp();
    }
    this.expBar.setValue(this.exp/this.getRequiredExp()*100);
  }

  clearHealth() {
    this.health = this.maxHealth;
    this.healthBar.setValue(this.maxHealth);
  }

  async levelUp() {
    this.expBar.setValue(100);
    await waitForDuration(new Duration({ milisecond: 100 }));
    this.level++;
  
    this.levelUpQueue.push(this.level);
  
    if (!this.isProcessingLevelUp) {
      await this.processLevelUpQueue();
    }

    if (this.exp >= this.getRequiredExp()) {
      await this.levelUp();
    } else {
      this.expBar.setValue(this.exp / this.getRequiredExp() * 100);
    }
  }

  async processLevelUpQueue() {
    if (this.isProcessingLevelUp) return;
  
    this.isProcessingLevelUp = true;
  
    while (this.levelUpQueue.length > 0) {
      const level = this.levelUpQueue.shift();
      await this.onLevelUp(level);
    }
  
    this.isProcessingLevelUp = false;
  }  

  *applyGravity() {
    while (true) {
      if (this.currentFloor) {
        this.sprite.position.y = this.currentFloor - 10;
        this.currentFloor = null;
      }
      else if (!this.checkGround()) {
        this.verticalVelocity = Math.min(this.verticalVelocity + this.GRAVITY, this.MAX_VELOCITY);
        this.sprite.position.y += this.verticalVelocity;
        if (!this.game.inGame(this.sprite)) {
          this.addHealth(-1);
        }
      }
      yield null;
    }
  }

  *dashPlayer() {
    this.canDash = false;
    const dashForce = 16;
    const friction = 0.4;
    let velocity = dashForce * this.lastDirection;
    
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
    
    this.canDash = true;
  }

  *attack() {
    if (this.canAttack) {
      this.canAttack = false;
      yield* this.weapon.attackAnimation();
      this.canAttack = true;
    }
  }

  *applyGravity() {
    while (true) {
      if (this.currentFloor) {
        this.sprite.position.y = this.currentFloor - 10;
        this.currentFloor = null;
      }
      else if (!this.checkGround()) {
        this.verticalVelocity = Math.min(this.verticalVelocity + this.GRAVITY, this.MAX_VELOCITY);
        this.sprite.position.y += this.verticalVelocity;
        if (!this.game.inGame(this.sprite)) {
          this.addHealth(-1);
        }
      }
      yield null;
    }
  }

  *dashPlayer() {
    this.canDash = false;
    const dashForce = 16;
    const friction = 0.4;
    let velocity = dashForce * this.lastDirection;
    
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
    
    this.canDash = true;
  }

  *attack() {
    if (this.canAttack) {
      this.canAttack = false;
      yield* this.weapon.attackAnimation();
      this.canAttack = true;
    }
  }

  pause() {
    this.pausedState = {
      keys: [false, false],
      canDash: true,
      canAttack: true,
      coroutines: { ...this.coroutines },
      keyboardEventListener: this.keyboardEventListener
    };
    
    if (this.keyboardEventListener) {
      this.game.removeKeyboardEventListener(this.keyboardEventListener);
      this.keyboardEventListener = null;
    }
    
    for (const key in this.coroutines) {
      if (this.coroutines[key]) {
        this.game.stopCoroutine(this.coroutines[key]);
        this.coroutines[key] = null;
      }
    }
    
    this.sprite.pause();
    this.weapon.pause();
  }

  resume() {
    if (this.pausedState) {
      this.keys = this.pausedState.keys;
      
      this.coroutines.movePlayer = this.game.startCoroutine(this.movePlayer.bind(this));
      this.coroutines.moveWeapon = this.game.startCoroutine(this.moveWeapon.bind(this));
      this.coroutines.applyGravity = this.game.startCoroutine(this.applyGravity.bind(this));

      this.keyboardEventListener = this.game.addKeyboardEventListener(this.pausedState.keyboardEventListener);
      
      this.canDash = this.pausedState.canDash;
      this.canAttack = this.pausedState.canAttack;
      
      this.sprite.play();
      this.weapon.resume();
      this.pausedState = null;
    }
  }
}

export default Player;