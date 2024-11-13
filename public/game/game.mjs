// 3

import createObservableEntity from './entity/observableEntity.mjs';
import Entity from './entity/entity.mjs';
import Color from './graphic/color.mjs';
import { CoroutineManager } from './util/coroutine.mjs';

/**
* Entity를 root에 추가하고 변경을 감지할 수 있는 Class입니다.
* addEntity로 Entity를 추가합니다.
*/
class Game {
  /**
  * 게임이 렌더링될 루트 요소를 지정하고 게임을 초기화합니다.
  * @param {HTMLElement} root
  */
  constructor(root) {
    this.root = root;
    this.root.game = this;
    this.root.classList.add("__rnini_root__")
    this.root.style.position = "relative";
    this.root.style.overflow = "hidden";
    this.coroutineManager = new CoroutineManager();
    this.offset = root.getBoundingClientRect();
    this.width = root.clientWidth;
    this.height = root.clientHeight;
    this.entities = new Map();
    this.keyboardEventListeners = new Set();
    this.elements = new Set();
    this.eventListeners = new Map();
    
    const handleKeyEvent = (type, event) => {
      this.keyboardEventListeners.forEach(listener => {
        listener(type, event);
      });
    };
    
    this.eventListeners.set('keydown', event => handleKeyEvent('keydown', event));
    this.eventListeners.set('keyup', event => handleKeyEvent('keyup', event));
    this.eventListeners.set('keypress', event => handleKeyEvent('keypress', event));
    
    this.eventListeners.forEach((handler, type) => {
      document.body.addEventListener(type, handler);
    });
  }

  /**
  * Entity를 추가하고 root에 렌더링합니다.
  * 상태 변화가 자동으로 감지됩니다.
  * @param {Entity} entity 추가할 Entity 객체
  * @param {int} layer 객체의 z-index
  * @returns {Proxy} 감지를 위한 Proxy 객체
  */
  addEntity(entity, layer) {
    if (layer) {
      entity.layer = layer;
    }
    const observableEntity = createObservableEntity(entity, () => {
      this.updateDOM(observableEntity);
    });
  
    const entityElement = observableEntity.render();
    this.root.appendChild(entityElement);
    this.entities.set(observableEntity, entityElement);

    return observableEntity;
  }

  addElement(element, layer) {
    if (layer) {
      element.style.zIndex = 'layer';
    }
    this.root.appendChild(element);
    this.elements.add(element);
    return element;
  }

  /**
  * Entity가 게임 안에 존재하는지 확인합니다.
  * @param {Entity} entity 비교할 Entity 객체
  * @returns {boolean} 존재 여부
  */
  inGame(entity) {
    return !(this.width < entity.position.x ||
    0 > entity.position.x + entity.size.width ||
    this.height < entity.position.y ||
    0 > entity.position.y + entity.size.height);
  }

  /**
  * 키보드 입력 이벤트를 핸들링하는 콜백 함수를 등록합니다.
  * 키보드 상호작용 시, 호출됩니다.
  * @param {Function} listener (String, KeyboardEvent)=>void
  * @returns {Function} listener
  */
  addKeyboardEventListener(listener) {
    this.keyboardEventListeners.add(listener);
    return listener;
  }

  /**
  * 등록된 키보드 이벤트 리스너를 제거합니다.
  * @param {Function} listener 제거할 리스너 함수
  */
  removeKeyboardEventListener(listener) {
    this.keyboardEventListeners.delete(listener);
  }

  /**
  * root의 배경을 설정합니다.
  * @param {Color|String} background 배경 색 또는 배경 이미지 
  */
  setBackground(background) {
    if (background instanceof Color) {
      this.root.style.backgroundColor = background.toString();
    } else {
      this.root.style.background = `url(${background})`;
    }
  }

  /**
  * 상태가 변경된 엔티티의 DOM을 업데이트하는 메서드
  * @param {Proxy} entity 업데이트할 Entity
  */
  updateDOM(entity, property, newValue) {
    if (this.entities.has(entity)) {
      const element = this.entities.get(entity);
      
      if (property === 'position') {
        element.style.left = `${newValue.x}px`;
        element.style.top = `${newValue.y}px`;
        return;
      }
      
      if (property === 'size') {
        element.style.width = `${newValue.width}px`;
        element.style.height = `${newValue.height}px`;
        return;
      }
      
      const newElement = entity.render();
      this.root.replaceChild(newElement, element);
      this.entities.set(entity, newElement);
    }
  }

  /**
  * 엔티티를 root에서 제거하는 메서드
  * @param {Entity} entity 제거할 Entity 객체
  */
  removeEntity(entity) {
    if (this.entities.has(entity)) {
      const element = this.entities.get(entity);
      this.root.removeChild(element);
      this.entities.delete(entity);
    }
  }

  removeElement(element) {
    if (this.elements.has(element)) {
      this.root.removeChild(element);
      this.elements.delete(element);
    }
  }

  /**
  * 제너레이터를 받아 코루틴을 시작합니다.
  * 반환된 함수는 나중에 stopCoroutine을 호출하여 중지할 수 있습니다.
  * @param {GeneratorFunction} generator 실행할 제너레이터(코루틴)
  * @returns {Function} 중지할 때 사용할 process
  */
  startCoroutine(generator) {
    return this.coroutineManager.startCoroutine(generator);
  }

  /**
  * 실행 중인 코루틴을 중지합니다.
  * @param {Function} process startCoroutine이 반환한 process
  */
  stopCoroutine(process) {
    this.coroutineManager.stopCoroutine(process);
  }

  destroy() {
    if (this.coroutineManager) {
      for (const process of this.coroutineManager.coroutines) {
        this.coroutineManager.stopCoroutine(process);
      }
    }
    this.eventListeners.forEach((handler, type) => {
      document.body.removeEventListener(type, handler);
    });
    this.eventListeners.clear();
    this.keyboardEventListeners.clear();
    if (this.root) {
      this.root.game = null;
      this.root.classList.remove("__rnini_root__");
    }

    this.root = null;
    this.coroutineManager = null;
    this.offset = null;
    this.width = 0;
    this.height = 0;
  }
}

export default Game;
