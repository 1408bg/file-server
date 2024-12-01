// 0

class Validator {
  static isNotClassType(value, classType) {
    return !(value instanceof classType);
  }

  static isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  static isNumberAll(...values) {
    return values.every(Validator.isNumber);
  }

  static isInteger(value) {
    return Number.isInteger(value);
  }

  static isIntegerAll(...values) {
    return values.every(Validator.isInteger);
  }

  static isFloat(value) {
    return Validator.isNumber(value);
  }

  static isFloatAll(...values) {
    return values.every(Validator.isFloat);
  }

  static isPositive(value) {
    return Validator.isNumber(value) && value >= 0;
  }

  static isPositiveAll(...values) {
    return values.every(Validator.isPositive);
  }

  static isNegative(value) {
    return Validator.isNumber(value) && value < 0;
  }

  static isNegativeAll(...values) {
    return values.every(Validator.isNegative);
  }

  static inRange(start, end, ...values) {
    return values.every(value => start <= value && value < end);
  }

  static isString(value) {
    return typeof value === 'string';
  }

  static isStringAll(...values) {
    return values.every(Validator.isString);
  }

  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  static isBooleanAll(...values) {
    return values.every(Validator.isBoolean);
  }

  static isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static isObjectAll(...values) {
    return values.every(Validator.isObject);
  }

  static isArray(value) {
    return Array.isArray(value);
  }

  static isArrayAll(...values) {
    return values.every(Validator.isArray);
  }

  static isFunction(value) {
    return typeof value === 'function';
  }

  static isFunctionAll(...values) {
    return values.every(Validator.isFunction);
  }

  static isEmpty(value) {
    if (value == null) return true; // covers both null and undefined
    if (Validator.isArray(value) || Validator.isString(value)) return value.length === 0;
    if (Validator.isObject(value)) return Object.keys(value).length === 0;
    return false;
  }

  static isEmptyAll(...values) {
    return values.every(Validator.isEmpty);
  }
}

export default Validator;