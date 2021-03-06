import * as React from 'react';
import { FilterValueOf, DataFilter, TYPE_STRING, TYPE_NUMBER } from 'mui-plus';

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
  return (
    <>
      {/** preview-start */}
      <DataFilter options={options} value={value} onChange={setValue} />
      {/** preview-end */}
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </>
  );
}
