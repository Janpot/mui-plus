import * as React from 'react';
import { FilterValueOf, DataFilter, InputComponentProps } from 'mui-plus';
import { MenuItem, Select } from '@material-ui/core';

interface Object {
  test1: string;
  test2: string;
  test3: number;
}

function SelectInput({ value, onChange }: InputComponentProps<string[]>) {
  return (
    <Select
      sx={{ width: 200 }}
      multiple
      size="small"
      value={value || []}
      onChange={(event) => onChange?.(event.target.value as string[])}
    >
      <MenuItem value="option1">Option 1</MenuItem>
      <MenuItem value="option2">Option 2</MenuItem>
      <MenuItem value="option3">Option 3</MenuItem>
      <MenuItem value="option4">Option 4</MenuItem>
    </Select>
  );
}

const options = [
  {
    field: 'test1',
    /// preview-start
    operators: [
      {
        operator: 'oneOf',
        label: 'is one of',
        defaultValue: [],
        InputComponent: SelectInput,
      },
    ],
    /// preview-end
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
