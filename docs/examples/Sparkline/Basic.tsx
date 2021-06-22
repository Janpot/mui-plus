import * as React from 'react';
import { Sparkline } from 'mui-plus';

const data = [
  9, 1, 14, 30, 34, 14, 29, 30, 20, 33, 38, 25, 4, 25, 38, 11, 15, 21, 31, 37,
  16, 17, 8, 18, 37, 28, 31, 22, 30, 8, 31, 14, 4, 36, 34, 2, 26, 35, 17, 2, 19,
  1, 30, 2, 16, 23, 35, 1, 14, 33,
];

export default function Basic() {
  return (
    /// preview-start
    <Sparkline data={data} />
    /// preview-end
  );
}
