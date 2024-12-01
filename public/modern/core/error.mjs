// 0

/** @typedef {'TYPE ERROR' | 'VALUE ERROR' | 'CALCULATION ERROR', 'INIT ERROR'} ErrorType */

class FakeWorksError extends Error {
  /**
  * @param {ErrorType} type 
  * @param {string} message 
  */
  constructor(type, message) {
    super(`[${type}] : ${message}`);
  }

  static type(message) {
    return new FakeWorksError('TYPE ERROR', message);
  }

  static autoType(identifier, type) {
    return new FakeWorksError('TYPE ERROR', `arguments '${identifier}' must be ${type}`);
  }

  static value(message) {
    return new FakeWorksError('VALUE ERROR', message);
  }

  static calc(message) {
    return new FakeWorksError('CALCULATION ERROR', message);
  }
}

export default FakeWorksError;