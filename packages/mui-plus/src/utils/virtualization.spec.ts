import * as virtualization from './virtualization';

test('middle of slice 1', () => {
  const slice = virtualization.getTableVirtualSlice({
    rowCount: 100,
    rowHeight: 50,
    columnCount: 40,
    getColumnStart: (i) => i * 100,
    viewportWidth: 800,
    viewportheight: 600,
    horizontalScroll: 524,
    verticalScroll: 273,
  });
  expect(slice).toEqual({
    startRow: 5,
    endRow: 17,
    startColumn: 6,
    endColumn: 14,
  });
});

test('start of slice', () => {
  const slice = virtualization.getTableVirtualSlice({
    rowCount: 100,
    rowHeight: 50,
    columnCount: 40,
    getColumnStart: (i) => i * 100,
    viewportWidth: 800,
    viewportheight: 600,
    horizontalScroll: 0,
    verticalScroll: 0,
  });
  expect(slice).toEqual({
    startRow: 0,
    endRow: 12,
    startColumn: 0,
    endColumn: 8,
  });
});

test('end of slice', () => {
  const slice = virtualization.getTableVirtualSlice({
    rowCount: 100,
    rowHeight: 50,
    columnCount: 40,
    getColumnStart: (i) => i * 100,
    viewportWidth: 800,
    viewportheight: 600,
    horizontalScroll: 3200,
    verticalScroll: 4400,
  });
  expect(slice).toEqual({
    startRow: 88,
    endRow: 99,
    startColumn: 32,
    endColumn: 39,
  });
});
