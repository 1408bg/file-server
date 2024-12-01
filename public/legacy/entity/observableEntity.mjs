// 2

/**
* 값을 변경 감지할 수 있도록 Proxy로 Entity를 감쌉니다.
* @param {Entity} entity 변경을 감지할 Entity
* @param {Function} onChange 변경 감지 시 실행될 함수
* @returns {Proxy} Proxy로 감싸진 Entity
*/
/**
* 값을 변경 감지할 수 있도록 `Proxy`를 사용하여 Entity를 감쌉니다.
* @param {Entity} entity 변경을 감지할 Entity
* @param {Function} onChange 변경 감지 시 실행될 함수
* @returns {Proxy} Proxy로 감싸진 Entity
*/
function createObservableEntity(entity, onChange) {
  let isUpdating = false;

  function createProxy(value) {
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value, {
        set(target, property, newValue) {
          if (target[property] !== newValue) {
            if (typeof newValue === 'object' && newValue !== null) {
              newValue = createProxy(newValue);
            }
            target[property] = newValue;

            if (!isUpdating && typeof onChange === 'function') {
              isUpdating = true;
              onChange(property, newValue);
              isUpdating = false;
            }
          }
          return true;
        }
      });
    }
    return value;
  }

  function wrapEntityProperties(entity) {
    for (const property in entity) {
      if (entity.hasOwnProperty(property)) {
        const value = entity[property];
        if (typeof value === 'object' && value !== null) {
          entity[property] = createProxy(value);
        }
      }
    }
  }

  wrapEntityProperties(entity);

  return new Proxy(entity, {
    set(target, property, value) {
      if (target[property] !== value) {
        if (typeof value === 'object' && value !== null) {
          value = createProxy(value);
        }
        target[property] = value;

        if (!isUpdating && typeof onChange === 'function') {
          isUpdating = true;
          onChange(property, value);
          isUpdating = false;
        }
      }
      return true;
    }
  });
}

export default createObservableEntity;