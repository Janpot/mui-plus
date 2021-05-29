import { clamp } from './math';

function getInterSectingIndexFixed(
  itemCount: number,
  itemSize: number,
  offset: number
): number {
  return clamp(Math.floor(offset / itemSize), 0, itemCount - 1);
}

function _getInterSectingIndexVariable(
  itemCount: number,
  getItemOffset: (index: number) => number,
  offset: number,
  sliceStart = 0,
  sliceEnd = itemCount
): number {
  if (sliceStart >= sliceEnd) {
    return sliceStart;
  }

  const pivot = sliceStart + Math.floor((sliceEnd - sliceStart) / 2);
  const itemOffset = getItemOffset(pivot);
  if (offset <= itemOffset) {
    return _getInterSectingIndexVariable(
      itemCount,
      getItemOffset,
      offset,
      sliceStart,
      pivot
    );
  } else {
    return _getInterSectingIndexVariable(
      itemCount,
      getItemOffset,
      offset,
      pivot + 1,
      sliceEnd
    );
  }
}

function getInterSectingIndexVariable(
  itemCount: number,
  getItemOffset: (index: number) => number,
  offset: number
): number {
  return _getInterSectingIndexVariable(itemCount, getItemOffset, offset);
}

function getVirtualSliceFixed(
  itemCount: number,
  itemSize: number,
  start: number,
  end: number
): [number, number] {
  return [
    getInterSectingIndexFixed(itemCount, itemSize, start),
    getInterSectingIndexFixed(itemCount, itemSize, end),
  ];
}

function getVirtualSliceVariable(
  itemCount: number,
  getItemOffset: (index: number) => number,
  start: number,
  end: number
): [number, number] {
  return [
    getInterSectingIndexVariable(itemCount, getItemOffset, start),
    getInterSectingIndexVariable(itemCount, getItemOffset, end),
  ];
}

interface GetVirtualSliceInput {
  rowCount: number;
  rowHeight: number;
  columnCount: number;
  getColumnStart: (index: number) => number;
  viewportWidth: number;
  viewportheight: number;
  horizontalScroll: number;
  verticalScroll: number;
  overscan?: number;
}

export function getTableVirtualSlice({
  rowCount,
  rowHeight,
  columnCount,
  getColumnStart,
  viewportWidth,
  viewportheight,
  horizontalScroll,
  verticalScroll,
  overscan = 0,
}: GetVirtualSliceInput) {
  const [firstVisibleRow, lastVisibleRow] = getVirtualSliceFixed(
    rowCount,
    rowHeight,
    verticalScroll,
    verticalScroll + viewportheight
  );
  const [firstVisibleColumn, lastVisibleColumn] = getVirtualSliceVariable(
    columnCount,
    getColumnStart,
    horizontalScroll,
    horizontalScroll + viewportWidth
  );
  const startRow = Math.max(0, firstVisibleRow - overscan);
  const endRow = Math.min(rowCount - 1, lastVisibleRow + overscan);
  const startColumn = Math.max(0, firstVisibleColumn - overscan);
  const endColumn = Math.min(columnCount - 1, lastVisibleColumn + overscan);
  return {
    startRow,
    endRow,
    startColumn,
    endColumn,
  };
}
