import * as React from 'react';
import { Sparkbars } from 'mui-plus';
import { Stack } from '@material-ui/core';

const data = [
  9, 1, 14, 30, 34, 14, 29, 30, 20, 33, 38, 25, 4, 25, 38, 11, 15, 21, 31, 37,
  16, 17, 8, 18, 37, 28, 31, 22, 30, 8,
];

export default function BaColorssic() {
  return (
    <Stack gap={2}>
      {/** preview-start */}
      <Sparkbars data={data} color="secondary" />
      {/** preview-end */}
      <Sparkbars data={data} color="success" />
      <Sparkbars data={data} color="warning" />
      <Sparkbars data={data} color="error" />
      <Sparkbars data={data} sx={{ color: '#c515eb' }} />
    </Stack>
  );
}
