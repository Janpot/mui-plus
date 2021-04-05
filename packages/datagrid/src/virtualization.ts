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
  first = 0,
  last = itemCount - 1
): number {
  if (first >= last) {
    return first - 1;
  }

  const pivot = first + Math.floor((last - first) / 2);
  const itemOffset = getItemOffset(pivot);
  if (offset < itemOffset) {
    return _getInterSectingIndexVariable(
      itemCount,
      getItemOffset,
      offset,
      first,
      pivot
    );
  } else {
    return _getInterSectingIndexVariable(
      itemCount,
      getItemOffset,
      offset,
      pivot + 1,
      last
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
