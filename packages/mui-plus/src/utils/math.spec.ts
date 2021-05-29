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
