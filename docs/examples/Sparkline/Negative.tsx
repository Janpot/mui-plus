import * as React from 'react';
import { Sparkline } from 'mui-plus';

const data = [-10, -31, -20, 14, -45, -1, 12];

export default function Basic() {
  return <Sparkline data={data} />;
}
