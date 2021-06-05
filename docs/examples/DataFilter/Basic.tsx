import * as React from 'react';
import {
  FilterValueOf,
  DataFilter2,
  DataFilter,
  Filter,
  FilterItem,
} from 'mui-plus';

interface Object {
  test1: string;
  test2: string;
  test3: number;
}

const options = [
  {
    field: 'test1',
  },
  {
    field: 'test2',
  },
  {
    field: 'test3',
  },
] as const;

export default function Basic() {
  const [value, setValue] = React.useState<Filter>([]);
  const [value2, setValue2] = React.useState<FilterValueOf<Object>[]>([]);
  return (
    <>
      <DataFilter value={value} onChange={setValue}>
        <FilterItem property="hello" condition={1}>
          Hello
        </FilterItem>
      </DataFilter>
      <pre>{JSON.stringify(value, null, 2)}</pre>
      <DataFilter2 options={options} value={value2} onChange={setValue2} />
      <pre>{JSON.stringify(value2, null, 2)}</pre>
    </>
  );
}
