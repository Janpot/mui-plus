import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import DataGrid, { DataGridProps } from './DataGrid';

export default {
  title: 'DataGrid',
  component: DataGrid,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta;

const Template: Story<DataGridProps> = (args) => <DataGrid {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  columns: {
    col1: {
      header: 'Column 1',
    },
    col2: {
      maxWidth: 250,
    },
  },
  data: [
    { key: 1, col1: 'foo1', col2: 'bar1' },
    { key: 2, col1: 'foo2', col2: 'bar2' },
    { key: 3, col1: 'foo3', col2: 'bar3' },
    { key: 4, col1: 'foo3', col2: 'bar3' },
    { key: 5, col1: 'foo3', col2: 'bar3' },
    { key: 6, col1: 'foo3', col2: 'bar3' },
    { key: 7, col1: 'foo3', col2: 'bar3' },
    { key: 8, col1: 'foo3', col2: 'bar3' },
    { key: 9, col1: 'foo3', col2: 'bar3' },
    { key: 10, col1: 'foo3', col2: 'bar3' },
  ],
  getKey: (row) => row.key,
};
