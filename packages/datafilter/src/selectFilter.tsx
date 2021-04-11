import * as React from 'react';
import { Box, MenuList, Button } from '@material-ui/core';
import { FilterEditorProps } from './DataFilter';

interface ListOption {
  key: string;
  label?: string;
}

type ListEditorProps = FilterEditorProps & {
  children?: React.ReactNode;
  listOptions: ListOption[];
};

export function ListEditor(props: ListEditorProps) {
  const { children } = props;
  const [selection, setSelection] = React.useState<number>();
  const disabled = selection === null;

  const options: { value: any; node: any }[] =
    React.Children.map(children, (child, i) => {
      if (!React.isValidElement(child)) {
        return {
          value: null,
          node: null,
        };
      }
      return {
        value: child.props.value,
        node: React.cloneElement(child, {
          key: i,
          value: undefined,
          selected: selection === i,
          onClick: () => {
            setSelection(i);
          },
        }),
      };
    }) || [];

  const handleSumbit = () => {
    if (typeof selection === 'number') {
      props.onChange(options[selection].value);
    }
  };

  return (
    <Box display="flex" flexDirection="column" minWidth={150}>
      <MenuList dense autoFocusItem>
        {options.map((menuItem) => menuItem.node)}
      </MenuList>
      <Box margin={1} alignSelf="flex-end">
        <Button
          disabled={disabled}
          color="primary"
          size="small"
          onClick={handleSumbit}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
}
