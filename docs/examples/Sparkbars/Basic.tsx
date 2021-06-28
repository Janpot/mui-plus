import * as React from 'react';
import { Sparkbars } from 'mui-plus';

const data = [
  9, 1, 14, 30, 34, 14, 29, 30, 20, 33, 38, 25, 4, 25, 38, 11, 15, 21, 31, 37,
  16, 17, 8, 18, 37, 28, 31, 22, 30, 8,
];

export default function Basic() {
  return (
    /// preview-start
    <Sparkbars data={data} />
    /// preview-end
  );
}
