import * as virtualization from './virtualization';

test('middle of slice 1', () => {
  const [startRow, endRow] = virtualization.getVirtualSliceFixed(
    100,
    50,
    273,
    873
  );
  expect(startRow).toBe(5);
  expect(endRow).toBe(18);

  const [startColumn, endColumn] = virtualization.getVirtualSliceVariable(
    100,
    (i) => i * 100,
    524,
    1324
  );
  expect(startColumn).toBe(6);
  expect(endColumn).toBe(15);
});

test('start of slice', () => {
  const [startRow, endRow] = virtualization.getVirtualSliceFixed(
    100,
    50,
    0,
    600
  );
  expect(startRow).toBe(0);
  expect(endRow).toBe(13);

  const [startColumn, endColumn] = virtualization.getVirtualSliceVariable(
    40,
    (i) => i * 100,
    0,
    800
  );
  expect(startColumn).toBe(0);
  expect(endColumn).toBe(9);
});

test('end of slice', () => {
  const [startRow, endRow] = virtualization.getVirtualSliceFixed(
    100,
    50,
    4400,
    5000
  );
  expect(startRow).toBe(88);
  expect(endRow).toBe(100);

  const [startColumn, endColumn] = virtualization.getVirtualSliceVariable(
    40,
    (i) => i * 100,
    3200,
    4000
  );
  expect(startColumn).toBe(32);
  expect(endColumn).toBe(40);
});
