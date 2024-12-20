// 1

import { Duration, FakeWorksError, Validator } from '../core/data.mjs';

const Coroutine = Object.getPrototypeOf(function*() {}).constructor;

class CoroutineManager {
  constructor() {
    this.coroutines = new Set();
  }

  startCoroutine(coroutine) {
    if (Validator.isNotClassType(coroutine, Coroutine)) {
      throw FakeWorksError.autoType('coroutine', 'Coroutine');
    }
    const iterator = coroutine();

    const process = () => {
      const { value, done } = iterator.next();

      if (done) {
        this.coroutines.delete(coroutine);
        return;
      }

      if (value === null) {
        requestAnimationFrame(() => {
          if (this.coroutines.has(coroutine)) process();
        });
      }
      else if (value instanceof Promise) {
        value.then(() => {
          if (this.coroutines.has(coroutine)) process();
        });
      } else {
        process();
      }
    };

    this.coroutines.add(coroutine);
    process();

    return coroutine;
  }

  stopCoroutine(coroutine) {
    if (Validator.isNotClassType(coroutine, Coroutine)) {
      throw FakeWorksError.autoType('coroutine', 'Coroutine');
    }
    this.coroutines.delete(coroutine);
  }
}

function waitForDuration(duration) {
  if (Validator.isNotClassType(duration, Duration)) {
    throw FakeWorksError.autoType('duration', 'Duration');
  }
  return new Promise(
    resolve => {
      const end = new Date().getTime() + duration.value;
      const check = () => {
        requestAnimationFrame(()=>{
          if (new Date().getTime() >= end) resolve();
          else check();
        });
      };
      check();
    }
  )
}

const coroutineManager = new CoroutineManager();
const startCoroutine = coroutineManager.startCoroutine.bind(coroutineManager);
const stopCoroutine = coroutineManager.stopCoroutine.bind(coroutineManager);

export { startCoroutine, stopCoroutine, waitForDuration };