import * as React from 'react';
import { FilterValueOf, DataFilter, TYPE_STRING, TYPE_NUMBER } from 'mui-plus';

interface Object {
  test1: string;
  test2: string;
  test3: number;
}

const options = [
  {
    field: 'test1',
    ...TYPE_STRING,
  },
  {
    field: 'test2',
    ...TYPE_STRING,
  },
  {
    field: 'test3',
    ...TYPE_NUMBER,
  },
] as const;

export default function Basic() {
  const [value, setValue] = React.useState<FilterValueOf<Object>[]>([]);
  return (
    <>
      <DataFilter options={options} value={value} onChange={setValue} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </>
  );
}
