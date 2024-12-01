import Color from './color.mjs';
import Size from './size.mjs';
import Vector from './vector.mjs';

function runTests(testCases, methodTests, ClassType, className, instanceInput) {
  let allTestsPassed = true;

  for (const { input, shouldThrow } of testCases) {
    try {
      const instance = new ClassType(input);
      if (shouldThrow) {
        console.warn(`Warning: Test with input ${JSON.stringify(input)} did not throw an error.`);
        allTestsPassed = false;
      }
    } catch (error) {
      if (!shouldThrow) {
        console.warn(`Warning: Test with input ${JSON.stringify(input)} threw an unexpected error.`);
        allTestsPassed = false;
      }
    }
  }

  const instance = new ClassType(instanceInput);
  for (const { testFunc, expected, shouldThrow } of methodTests) {
    try {
      const result = testFunc(instance.copy());
      if (expected !== null && typeof expected === 'number' ? result !== expected : !result.equals(expected)) {
        console.warn(`Warning: Test function did not return expected ${className}.\n`, `expected: ${expected.toString()}, result: ${result.toString()}\n`, testFunc.toString());
        allTestsPassed = false;
      }
    } catch (error) {
      if (!shouldThrow) {
        console.warn(`Warning: Unexpected error in test function: ${testFunc.toString()}\n`, error.toString());
        allTestsPassed = false;
      }
    }
  }

  if (allTestsPassed) {
    console.log(`All ${className} tests passed successfully.`);
  }
}

function colorTest() {
  const testCases = [
    {
      input: { r: 255, g: 100, b: 50, a: 1 },
      shouldThrow: false,
    },
    {
      input: { r: -1, g: 100, b: 50, a: 1 },
      shouldThrow: true,
    },
    {
      input: { r: 255, g: 100, b: 50, a: 1.5 },
      shouldThrow: true,
    },
    {
      input: { r: 255, g: 100, b: 50, a: -0.5 },
      shouldThrow: true,
    },
    {
      input: { r: 256, g: 100, b: 50, a: 1 },
      shouldThrow: true,
    },
  ];

  const methodTests = [
    {
      testFunc: (color) => color.adjustAlpha(0.5),
      expected: new Color({ r: 100, g: 100, b: 100, a: 0.5 }),
      shouldThrow: false
    },
    {
      testFunc: (color) => color.adjustAlpha(1.5),
      expected: null,
      shouldThrow: true
    },
    {
      testFunc: (color) => color.lighten(20),
      expected: new Color({ r: 120, g: 120, b: 120, a: 1 }),
      shouldThrow: false
    },
    {
      testFunc: (color) => color.darken(300),
      expected: new Color({ r: 0, g: 0, b: 0, a: 1 }),
      shouldThrow: false
    },
  ];

  runTests(testCases, methodTests, Color, 'color', { r: 100, g: 100, b: 100, a: 1 });
}

function sizeTest() {
  const testCases = [
    {
      input: { width: 100, height: 200 },
      shouldThrow: false,
    },
    {
      input: { width: -1, height: 200 },
      shouldThrow: true,
    },
    {
      input: { width: 100, height: -1 },
      shouldThrow: true,
    },
  ];

  const methodTests = [
    {
      testFunc: (size) => size.increase({ width: 50, height: 50 }),
      expected: new Size({ width: 150, height: 250 }),
      shouldThrow: false
    },
    {
      testFunc: (size) => size.decrease({ width: 200, height: 100 }),
      expected: new Size({ width: 0, height: 100 }),
      shouldThrow: false
    },
    {
      testFunc: (size) => size.scale(2),
      expected: new Size({ width: 200, height: 400 }),
      shouldThrow: false
    },
    {
      testFunc: (size) => size.divide(new Size({ width: 0, height: 0 })),
      expected: null,
      shouldThrow: true
    },
  ];

  runTests(testCases, methodTests, Size, 'size', { width: 100, height: 200 });
}

function vectorTest() {
  const testCases = [
    {
      input: { x: 10, y: 20 },
      shouldThrow: false,
    },
    {
      input: { x: 'a', y: 20 },
      shouldThrow: true,
    },
    {
      input: { x: 10, y: 'b' },
      shouldThrow: true,
    },
    {
      input: { x: 0.1, y: 2 },
      shouldThrow: false
    }
  ];

  const methodTests = [
    {
      testFunc: (vector) => vector.increase({ x: 5, y: 5 }),
      expected: new Vector({ x: 15, y: 25 }),
      shouldThrow: false
    },
    {
      testFunc: (vector) => vector.decrease({ x: 5, y: 5 }),
      expected: new Vector({ x: 5, y: 15 }),
      shouldThrow: false
    },
    {
      testFunc: (vector) => vector.distance(new Vector({ x: 0, y: 0 })),
      expected: Math.sqrt(500),
      shouldThrow: false
    },
    {
      testFunc: (vector) => vector.set(new Vector({ x: 30, y: 40 })),
      expected: new Vector({ x: 30, y: 40 }),
      shouldThrow: false
    },
    {
      testFunc: (vector) => vector.set({ x: 30, y: 40 }),
      expected: null,
      shouldThrow: true
    }
  ];

  runTests(testCases, methodTests, Vector, 'vector', { x: 10, y: 20 });
}

function graphicTest() {
  console.info('[START] start grapic test');
  colorTest();
  sizeTest();
  vectorTest();
}

graphicTest();

export default graphicTest;