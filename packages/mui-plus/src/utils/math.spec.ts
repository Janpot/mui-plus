import * as math from './math';

test.each([
  [4, 2, 6, 4],
  [4, 6, 8, 6],
  [4, 0, 2, 2],
  [4, 6, 2, 6],
  [8, 6, 2, 6],
])('clamps value %p between %p and %p to %p', (value, min, max, expected) => {
  expect(math.clamp(value, min, max)).toBe(expected);
});

test.each([
  [0.5, 0, 1],
  [-0.5, 0, -1],
  [1.005, 2, 1.01],
  [2.175, 2, 2.18],
  [5.015, 2, 5.02],
  [-1.005, 2, -1.01],
  [-2.175, 2, -2.18],
  [-5.015, 2, -5.02],
])('rounds %d with %d decimals to %d', (value, decimals, expected) => {
  expect(math.round(value, decimals)).toBe(expected);
});
