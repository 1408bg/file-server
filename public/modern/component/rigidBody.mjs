// 4

import { Vector } from '../graphic/data.mjs';
import { FakeWorksError, Validator } from '../core/data.mjs';
import Component from '../component/component.mjs';
import { startCoroutine, stopCoroutine } from '../system/coroutine.mjs';

/** @typedef {'DYNAMIC' | 'KINEMATIC' | 'STATIC'} BodyType */

class RigidBody extends Component {
  /** @type {number} */
  #mass;
  /** @type {Vector} */
  #gravity;
  /** @type {Vector} */
  #velocity;
  /** @type {Vector} */
  #force;
  /** @type {BodyType} */
  #body;
  /** @type {number} */
  #drag

  static get bodyType() {
    return {
      dynamic: 'DYNAMIC',
      kinematic: 'KINEMATIC',
      static: 'STATIC'
    };
  }

  constructor({ mass = 1, gravity = new Vector({ x: 0, y: 9.8 }), body = 'DYNAMIC', drag = 1 }) {
    super();
    if (!Validator.isPositive(mass)) {
      throw FakeWorksError.value('mass must be a positive number');
    }
    if (Validator.isNotClassType(gravity, Vector)) {
      throw FakeWorksError.autoType('gravity', 'Vector');
    }
    if (!Validator.isPositive(drag)) {
      throw FakeWorksError.value('drag must be a positive number');
    }

    this.#mass = mass;
    this.#gravity = gravity;
    this.#velocity = Vector.zero;
    this.#force = Vector.zero;
    this.#body = body;
    this.#drag = drag;
  }

  initialize({object}) {
    super.initialize({object: object});
    startCoroutine(this.loop.bind(this));
  }

  remove() {
    stopCoroutine(this.loop.bind(this));
    super.remove();
  }

  get mass() { return this.#mass; }
  get velocity() { return this.#velocity; }
  get body() { return this.#body; }
  get drag() { return this.#drag; }
  get speed() { return this.#velocity.magnitude(); }
  
  
  set velocity(newVelocity) {
    if (Validator.isNotClassType(newVelocity, Vector)) {
      throw FakeWorksError.autoType('newVelocity', 'Vector');
    }
    this.#velocity = newVelocity;
  }
  
  set drag(newDrag) {
    if (!Validator.isPositive(newDrag)) {
      throw FakeWorksError.value('newDrag must be a positive number');
    }
    this.#drag = newDrag;
  }
  
  addForce(force) {
    if (Validator.isNotClassType(force, Vector)) {
      throw FakeWorksError.autoType('force', 'Vector');
    }
    this.#force.add(force);
    const acceleration = this.#force.copy().scale(1 / this.#mass);
    this.#velocity.add(acceleration);
  }
  
  addImpulse(impulse) {
    if (Validator.isNotClassType(impulse, Vector)) {
      throw FakeWorksError.autoType('impulse', 'Vector');
    }
    this.#velocity.add(impulse.copy().scale(1 / this.#mass));
  }

  *loop() {
    while (true) {
      this.update();
      yield null;
    }
  }

  update() {
    this.#force = Vector.zero;
    if (this.#body === 'STATIC') return;

    if (this.#body === 'KINEMATIC') {
      const normalize = this.#velocity.copy().normalize();
      const dragForce = normalize.copy().scale(-this.#drag);
      if (normalize.x > 0) {
        this.#velocity.x = Math.max(0, this.#velocity.x + dragForce.x);
      } else {
        this.#velocity.x = Math.min(0, this.#velocity.x + dragForce.x);
      }
      if (normalize.y > 0) {
        this.#velocity.y = Math.max(0, this.#velocity.y + dragForce.y);
      } else {
        this.#velocity.y = Math.min(0, this.#velocity.y + dragForce.y);
      }
      
      

      const threshold = 0.01;
      if (this.#velocity.magnitude() < threshold) {
        this.#velocity = Vector.zero;
      }

      this.object.position.add(this.#velocity);
      this.object.applyPosition();
      return;
    }
    
    // 여기 DYNAMIC은 망했어!
    // 이제부터는 KINEMATIC이 점령한다!
  }

  resolveCollision(other) {
    if (Validator.isNotClassType(other, RigidBody)) {
      throw FakeWorksError.autoType('other', 'Rigidbody');
    }
    
    const normal = this.object.position.copy().subtract(other.object.position).normalize();
    const relativeVelocity = this.velocity.copy().subtract(other.velocity);
    
    if (relativeVelocity.dotProduct(normal) > 0) return;

    const velocityAlongNormal = relativeVelocity.dotProduct(normal);
    const impulseMagnitude = -velocityAlongNormal / (1 / this.#mass + 1 / other.mass);
    
    const impulse = normal.scale(impulseMagnitude);

    this.#velocity.add(impulse.copy().scale(1 / this.#mass));
    other.addImpulse(impulse.copy().negate());
  }
}

export default RigidBody;