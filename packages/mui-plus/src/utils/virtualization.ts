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
  return offset <= itemOffset
    ? _getInterSectingIndexVariable(
        itemCount,
        getItemOffset,
        offset,
        sliceStart,
        pivot
      )
    : _getInterSectingIndexVariable(
        itemCount,
        getItemOffset,
        offset,
        pivot + 1,
        sliceEnd
      );
}

function getInterSectingIndexVariable(
  itemCount: number,
  getItemOffset: (index: number) => number,
  offset: number
): number {
  return _getInterSectingIndexVariable(itemCount, getItemOffset, offset);
}

type Slice = [
  /** Zero-based index of the start of the slice */
  start: number,
  /** Zero-based index of the end of the slice, but not included */
  end: number
];

function createSlice(
  start: number,
  end: number,
  itemCount: number,
  overscan: number
): Slice {
  return [Math.max(0, start - overscan), Math.min(itemCount, end + overscan)];
}

/**
 * Calculates a slice for a virtualized set of items of fixed size.
 * The slice returns values that correspond to the `Array.prototype.slice` method
 */
export function getVirtualSliceFixed(
  itemCount: number,
  itemSize: number,
  start: number,
  end: number,
  overscan: number = 0
): Slice {
  return createSlice(
    getInterSectingIndexFixed(itemCount, itemSize, start),
    getInterSectingIndexFixed(itemCount, itemSize, end) + 1,
    itemCount,
    overscan
  );
}

/**
 * Calculates a slice for a virtualized set of items of variable size.
 * The slice returns values that correspond to the `Array.prototype.slice` method
 */
export function getVirtualSliceVariable(
  itemCount: number,
  getItemOffset: (index: number) => number,
  start: number,
  end: number,
  overscan: number = 0
): Slice {
  return createSlice(
    getInterSectingIndexVariable(itemCount, getItemOffset, start),
    getInterSectingIndexVariable(itemCount, getItemOffset, end) + 1,
    itemCount,
    overscan
  );
}
