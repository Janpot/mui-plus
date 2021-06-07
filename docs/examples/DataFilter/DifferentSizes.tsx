import * as React from 'react';
import { FilterValueOf, DataFilter, TYPE_STRING, TYPE_NUMBER } from 'mui-plus';
import { Stack } from '@material-ui/core';

interface Object {
  url: string;
  title: string;
  visits: number;
}

const options = [
  {
    field: 'url',
    label: 'Page Url',
    ...TYPE_STRING,
  },
  {
    field: 'title',
    label: 'Page Title',
    ...TYPE_STRING,
  },
  {
    field: 'visits',
    label: 'Visits',
    ...TYPE_NUMBER,
  },
] as const;

export default function Basic() {
  const [value, setValue] = React.useState<FilterValueOf<Object>[]>([]);
  const props = { options, value, onChange: setValue };
  return (
    <Stack spacing={2}>
      {/** preview-start */}
      <DataFilter {...props} size="small" />
      <DataFilter {...props} size="medium" />
      {/** preview-end */}
    </Stack>
  );
}
