import { Sprite } from '../entity/data.mjs';
import { Size, Position, Color, EdgeInsets } from '../graphic/data.mjs';
import { ProgressIndicator } from '../ui/data.mjs';
import { Duration, waitForDuration } from '../util/data.mjs';
import Scythe from './weapons/scythe.js';
import HTMLBuilder from '../ui/htmlBuilder.mjs';

class Player {
  constructor(game, position, groundHeight, onDead, onLevelUp) {
    this.game = game;
    this.onDead = onDead;
    this.onLevelUp = onLevelUp;
    this.game.player = this;
    this.keys = [false, false];
    this.canDash = true;
    this.canAttack = true;
    this.canWeaponSkill = true;
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
    this.keyboardEventListener = (type, event) => {
      const key = event.key.toLowerCase();
      if (type === 'keydown') {
        if (key === 'a') {
          this.moveLeft();
        } else if (key === 'd') {
          this.moveRight();
        } else if (key === 'w') {
          this.jump();
        } else if (key === ' ') {
          this.dash();
        }
      } else if (type === 'keyup') {
        if (key === 'a') {
          this.stopLeft();
        } if (key === 'd') {
          this.stopRight();
        }
      }
    };
    this.mouseEventListener = (type, button, event) => {
      event.preventDefault();
      if (type === 'mousedown') {
        if (button === 'left') {
          this.attack();
        } else {
          this.weaponSkill();
        }
      }
    };
    
    this.sprite = new Sprite(
      position,
      new Size(160, 160),
      './assets/player-sheet.png',
      4,
      2,
      new Duration({milisecond: 200}),
      new Position(0.5, 0.8)
    );
    this.sprite.layer = 20;

    this.weapon = new Scythe(new Position(position.x, position.y));

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

    this.setupEventControls();
    this.buildUI();
    this.initializeGameObjects();
  }

  moveLeft() {
    this.keys[0] = true;
    this.lastDirection = -1;
  }

  stopLeft() {
    this.keys[0] = false;
    if (this.keys[1]) {
      this.lastDirection = 1;
    }
  }

  moveRight() {
    this.keys[1] = true;
    this.lastDirection = 1;
  }

  stopRight() {
    this.keys[1] = false;
    if (this.keys[0]) {
      this.lastDirection = -1;
    }
  }

  jump() {
    if (this.checkGround()) {
      this.verticalVelocity -= 15;
    }
  }

  dash() {
    if (this.canDash) {
      this.coroutines.dash = this.game.startCoroutine(this.dashFlow.bind(this));
    }
  }

  attack() {
    this.coroutines.attack = this.game.startCoroutine(this.attackFlow.bind(this));
  }

  weaponSkill() {
    if (this.canWeaponSkill) {
      this.game.startCoroutine(this.weaponSkillFlow.bind(this));
    }
  }

  setupEventControls() {
    if (this.game.platform === 'WEB') {
      this.game.addKeyboardEventListener(this.keyboardEventListener);
      this.game.addMouseEventListener(this.mouseEventListener);
    }
  }

  initializeGameObjects() {
    this.game.addEntity(this.sprite);
    this.game.addEntity(this.weapon);
    this.game.addEntity(this.weapon.hitbox);
    this.game.addEntity(this.healthBar);
    this.game.addEntity(this.expBar);
    
    this.coroutines.movePlayer = this.game.startCoroutine(this.moveCoroutine.bind(this));
    this.coroutines.moveWeapon = this.game.startCoroutine(this.moveWeaponCoroutine.bind(this));
    this.coroutines.applyGravity = this.game.startCoroutine(this.gravityCoroutine.bind(this));
    this.game.startCoroutine(this.sprite.animationLoop.bind(this.sprite));
    
    this.sprite.startAnimation();
  }

  buildUI() {
    const game = this.game;
    const isApp = game.platform !== 'WEB';
    this.healthBar = ProgressIndicator.liner(
      isApp ? new Position(0, 50) : new Position(this.game.width/2 - this.game.width*0.4, this.game.height - 100),
      isApp ? new Size(game.width*0.4, 40) : new Size(game.width*0.8, 40),
      Color.fromHex('#440000'),
      Color.fromHex('#ff0000'),
      100,
      0.3
    );
    this.expBar = ProgressIndicator.liner(
      isApp ? new Position(0, 50) : new Position(this.game.width/2 - this.game.width*0.4, this.game.height - 100),
      isApp ? new Size(game.width*0.4, 15) : new Size(game.width*0.8, 15),
      Color.fromHex('#226622'),
      Color.fromHex('#00ff00'),
      0,
      0.3
    );
    HTMLBuilder.defaultPadding = EdgeInsets.symmetric({vertical: 4, horizontal: 8});
    if (game.platform !== 'WEB') {
      const uiContainer = new HTMLBuilder('div')
      .setSize(new Size(game.width))
      .setLayer(31)
      .flex('space-evenly', 'center', 'row', 10)
      .setPosition(new Position(0, game.height-100))
      .append(
        new HTMLBuilder('div')
        .column(
          new HTMLBuilder('button')
          .button(
            '↑',
            () => this.jump()
          ).build(),
          new HTMLBuilder('div')
          .row(
            new HTMLBuilder('button')
            .button(
              '←',
              () => this.moveLeft(),
              {
                onUp: () => this.stopLeft()
              }
            ).build(),
            new HTMLBuilder('button')
            .button(
              '→',
              () => this.moveRight(),
              {
                onUp: () => this.stopRight()
              }
            ).build()
          ).build(),
          new HTMLBuilder('button')
          .button(
            '↓',
            () => this.dash()
          ).build()
        ).build(),
        new HTMLBuilder('div')
        .column(
          new HTMLBuilder('button')
          .button(
            '⚔️',
            () => this.attack()
          ).build(),
          new HTMLBuilder('button')
          .button(
            '💫',
            () => this.weaponSkill()
          ).build()
        ).build()
      ).build();
      game.addElement(uiContainer);
    }
  }

  *moveCoroutine() {
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

  *weaponSkillFlow() {
    this.canWeaponMove = false;
    this.canWeaponSkill = false;
    this.canAttack = false;
    yield* this.weapon.skill(this.sprite, this.lastDirection);
    this.canAttack = true;
    this.canWeaponMove = true;
    yield waitForDuration(this.weapon.skillCooldown);
    this.canWeaponSkill = true;
  }

  *moveWeaponCoroutine() {
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
      this.healthBar.setValue(-999);
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

  *dashFlow() {
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

  *attackFlow() {
    if (this.canAttack) {
      this.canAttack = false;
      yield* this.weapon.attackAnimation();
      this.canAttack = true;
    }
  }

  *gravityCoroutine() {
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

  *dashFlow() {
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

  *attackFlow() {
    if (this.canAttack) {
      this.canAttack = false;
      yield* this.weapon.attackAnimation();
      this.canAttack = true;
    }
  }

  pause() {
    this.pausedState = {
      keys: [false, false],
      coroutines: { ...this.coroutines }
    };
    
    this.game.removeKeyboardEventListener(this.keyboardEventListener);
    this.game.removeMouseEventListener(this.mouseEventListener);
    
    for (const key in this.coroutines) {
      if (this.coroutines[key]) {
        this.game.stopCoroutine(this.coroutines[key]);
        this.coroutines[key] = null;
      }
    }
    
    this.sprite.stopAnimation();
    this.weapon.pause();
  }

  resume() {
    if (this.pausedState) {
      this.keys = this.pausedState.keys;
      
      this.coroutines.movePlayer = this.game.startCoroutine(this.moveCoroutine.bind(this));
      this.coroutines.moveWeapon = this.game.startCoroutine(this.moveWeaponCoroutine.bind(this));
      this.coroutines.applyGravity = this.game.startCoroutine(this.gravityCoroutine.bind(this));

      this.setupEventControls();
      
      this.canDash = true;
      this.canAttack = true;
      
      this.sprite.startAnimation();
      this.weapon.resume();
      this.pausedState = null;
    }
  }
}

export default Player;