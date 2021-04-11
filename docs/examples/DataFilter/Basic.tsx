import * as React from 'react';
import { DataFilter, Filter, FilterItem } from 'mui-plus';

export default function Basic() {
  const [value, setValue] = React.useState<Filter>([]);
  return (
    <>
      <DataFilter value={value} onChange={setValue}>
        <FilterItem property="hello" label="Hello" condition={1}>
          hello
        </FilterItem>
      </DataFilter>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </>
  );
}
