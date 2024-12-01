// 2

import Game from "../game.mjs";
import Entity from "./entity.mjs";

class Prefab {
  /**
  * @param {Entity} entity 복제할 Entity 객체 또는 그를 상속한 객체
  * @param {Game} game entity가 추가될 game 객체
  */
  constructor(entity, game) {
    this.entityTemplate = entity;
    this.game = game;
    this.instantiatedEntities = new Map();
  }

  /**
  * 저장된 Entity의 복제본을 생성하여 game에 추가합니다.
  * @param {Function} [setup] 복제본을 추가하기 전에 전처리를 합니다 (옵션)
  * @returns {Entity} 생성된 복제본
  */
  instantiate(setup) {
    let entityCopy = this.entityTemplate.copy();

    if (setup) {
      entityCopy = setup(entityCopy);
    }

    this.instantiatedEntities.set(entityCopy, this.game.addEntity(entityCopy));

    return entityCopy;
  }

  /**
  * 생성한 복제본을 제거합니다.
  * @param {Entity} entity 삭제할 복제본
  * @param {Function} onDestroyed 삭제 완료 시 호출될 함수
  */
  destroy(entity, onDestroyed) {
    if (this.instantiatedEntities.has(entity)) {
      this.game.removeEntity(this.instantiatedEntities.get(entity));
      this.instantiatedEntities.delete(entity);
      onDestroyed();
    }
  }

  /**
  * 생성한 모든 복제본을 제거합니다.
  */
  destroyAll() {
    for (const entity of this.instantiatedEntities) {
      this.destroy(entity);
    }
  }

  /**
  * 생성된 복제본의 개수를 반환합니다.
  * @returns {number} 생성된 복제본의 개수
  */
  count() {
    return this.instantiatedEntities.size;
  }
}

export default Prefab;