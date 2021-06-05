import {
  Box,
  Chip,
  experimentalStyled as styled,
  PopoverActions,
  Popover,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Stack,
  Select,
  Typography,
} from '@material-ui/core';
import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';

interface InputComponentProps<ValueType> {
  value?: ValueType;
  onChange?: (newValue: ValueType) => void;
}
type InputComponent<ValueType> = React.JSXElementConstructor<
  InputComponentProps<ValueType>
>;

interface OptionParams<ValueType> {
  operators: string[];
  label?: string;
  InputComponent: InputComponent<ValueType>;
}

export interface Option<Field, ValueType> extends OptionParams<ValueType> {
  field: Field;
}

export interface FilterValue<Field, Value> {
  field: Field;
  operator: string;
  value: Value;
}

export type OptionOf<Row extends object> = {
  [Key in keyof Row]: Option<Key, Row[Key]>;
}[keyof Row];

export type FilterValueOf<Row extends object> = {
  [Key in keyof Row]: FilterValue<Key, Row[Key]>;
}[keyof Row];

const DataFilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const NewDataFilterChip = styled(DataFilterChip)({
  borderStyle: 'dashed',
});

export function StringInputComponent({
  value,
  onChange,
}: InputComponentProps<string>) {
  return (
    <TextField
      autoFocus
      size="small"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

export function NumberInputComponent({
  value,
  onChange,
}: InputComponentProps<number>) {
  return (
    <TextField
      type="number"
      autoFocus
      size="small"
      value={value}
      onChange={(event) => onChange?.(Number(event.target.value))}
    />
  );
}

export const TYPE_STRING: OptionParams<string> = {
  operators: ['contains', 'equals', 'starts with', 'ends with'],
  InputComponent: StringInputComponent,
};

export const TYPE_NUMBER: OptionParams<number> = {
  operators: ['=', '>', '<', '>=', '<='],
  InputComponent: NumberInputComponent,
};

interface OptionEditorProps<Row extends object, Option extends OptionOf<Row>> {
  option: Option;
  onSubmit?: (operator: string, newvalue: Row[Option['field']]) => void;
  onClose?: () => void;
}

function OptionEditor<Row extends object, Option extends OptionOf<Row>>({
  option,
  onSubmit,
  onClose,
}: OptionEditorProps<Row, Option>) {
  const [value, setValue] = React.useState<Row[Option['field']]>();
  const [operator, setOperator] = React.useState(option.operators[0]);
  const { InputComponent } = option;
  return (
    <Stack direction="column">
      <Stack direction="row" alignItems="center" spacing={2} m={2} mb={1}>
        <Typography>{option.field}</Typography>{' '}
        <Select
          size="small"
          value={operator}
          onChange={(event) => setOperator(event.target.value)}
        >
          {option.operators.map((operator) => (
            <MenuItem key={operator} value={operator}>
              {operator}
            </MenuItem>
          ))}
        </Select>
        <InputComponent value={value} onChange={setValue} />
      </Stack>
      <Box m={1} display="flex" justifyContent="flex-end">
        <Button onClick={onClose}>cancel</Button>
        <Button
          disabled={!value}
          onClick={() => (value ? onSubmit?.(operator, value) : null)}
        >
          add
        </Button>
      </Box>
    </Stack>
  );
}

export interface DataFilterProps<Row extends object> {
  options: Readonly<OptionOf<Row>[]>;
  value?: FilterValueOf<Row>[];
  onChange?: (newObject: FilterValueOf<Row>[]) => void;
}

export default function DataFilter<Row extends object>({
  options,
  value = [],
  onChange,
}: DataFilterProps<Row>) {
  const popperRef = React.useRef<PopoverActions>(null);
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const menuOpen = !!anchorEl;
  const [editedOption, setEditedOption] =
    React.useState<OptionOf<Row> | null>(null);
  // @ts-ignore
  const [editedIndex, setEditedIndex] = React.useState<number | null>(null);

  const handleDelete = (index: number) => () => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const handleCreateNew = React.useCallback((event: React.MouseEvent) => {
    setEditedOption(null);
    setEditedIndex(null);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleEditorClose = () => {
    setAnchorEl(null);
  };

  const handleEditorSubmit = <K extends keyof Row>(
    field: K,
    operator: string,
    newValue: Row[K]
  ) => {
    // if (typeof editedIndex === 'number') {
    //   onChange(
    //     value.map((filterValue, index) => {
    //       if (index === editedIndex) {
    //         return {
    //           ...filterValue,
    //           value: newValue,
    //         };
    //       } else {
    //         return filterValue;
    //       }
    //     })
    //   );
    //   setEditedOption(null);
    //   setEditedIndex(null);
    // } else {
    onChange?.([...value, { field, operator, value: newValue }]);
    // }
    handleEditorClose();
  };

  const menuContent = React.useMemo(() => {
    return options.map((option, i) => {
      return (
        <MenuItem key={i} onClick={() => setEditedOption(option)}>
          {option.label || option.field}
        </MenuItem>
      );
    });
  }, [options]);

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      {value.map((item, index) => {
        return (
          <DataFilterChip
            key={index}
            label={item.field}
            onDelete={handleDelete(index)}
          />
        );
      })}
      <NewDataFilterChip
        icon={<AddIcon />}
        label="Add a filter"
        variant="outlined"
        onClick={handleCreateNew}
      />
      <Popover
        action={popperRef}
        open={menuOpen}
        anchorEl={anchorEl}
        onClose={handleEditorClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {editedOption ? (
          <OptionEditor<Row, OptionOf<Row>>
            option={editedOption}
            onSubmit={(operator, value) =>
              handleEditorSubmit(editedOption.field, operator, value)
            }
            onClose={handleEditorClose}
          />
        ) : (
          <MenuList dense autoFocusItem>
            {menuContent}
          </MenuList>
        )}
      </Popover>
    </Box>
  );
}
