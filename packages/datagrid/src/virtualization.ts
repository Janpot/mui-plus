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

export function getVirtualSliceFixed(
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

export function getVirtualSliceVariable(
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
