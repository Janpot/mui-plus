import * as React from 'react';
import { SelectionList } from 'mui-plus';

const options = ['red', 'green', 'blue', 'orange', 'violet', 'yellow'];

export default function Basic() {
  const [value, setValue] = React.useState<string[]>([]);
  return (
    <>
      {/** preview-start */}
      <SelectionList
        defaultOptions={options}
        value={value}
        onChange={setValue}
      />
      {/** preview-end */}
    </>
  );
}
