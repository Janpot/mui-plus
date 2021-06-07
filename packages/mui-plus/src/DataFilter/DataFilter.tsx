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
import { Collapse } from '@material-ui/core';
import { TransitionGroup } from 'react-transition-group';

export interface InputComponentProps<ValueType> {
  value?: ValueType;
  onChange?: (newValue: ValueType) => void;
}

export type InputComponent<ValueType> = React.JSXElementConstructor<
  InputComponentProps<ValueType>
>;

interface Operator<ValueType> {
  operator: string;
  label?: string;
  defaultValue: ValueType;
  InputComponent: InputComponent<ValueType>;
}

interface OptionParams<ValueType> {
  operators: readonly Operator<any>[];
  label?: string;
}

export interface Option<Field, ValueType> extends OptionParams<ValueType> {
  field: Field;
}

export interface FilterValue<Field, Value> {
  field: Field;
  operator: string;
  value: any;
}

export type OptionOf<Row extends object> = {
  [Key in keyof Row]: Option<Key, Row[Key]>;
}[keyof Row];

export type FilterValueOf<Row extends object> = {
  [Key in keyof Row]: FilterValue<Key, any>;
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

export function stringCompareOperator(
  operator: string,
  label?: string
): Operator<string> {
  return {
    operator,
    label,
    defaultValue: '',
    InputComponent: StringInputComponent,
  };
}

export const TYPE_STRING: OptionParams<string> = {
  operators: [
    stringCompareOperator('contains'),
    stringCompareOperator('equals'),
    stringCompareOperator('startsWith', 'starts with'),
    stringCompareOperator('endsWith', 'ends with'),
  ],
};

export function numericCompareOperator(
  operator: string,
  label?: string
): Operator<number> {
  return {
    operator,
    label,
    defaultValue: 0,
    InputComponent: NumberInputComponent,
  };
}

export const TYPE_NUMBER: OptionParams<number> = {
  operators: [
    numericCompareOperator('='),
    numericCompareOperator('>'),
    numericCompareOperator('<'),
    numericCompareOperator('>=', '≥'),
    numericCompareOperator('<=', '≤'),
  ],
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
  const [operatorIdx, setOperatorIdx] = React.useState(0);

  const { InputComponent, defaultValue } = option.operators[operatorIdx];

  const [input, setInput] = React.useState<any>(defaultValue);
  React.useEffect(() => setInput(defaultValue), [defaultValue]);

  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (input && event.code === 'Enter') {
        onSubmit?.(option.operators[operatorIdx].operator, input);
      } else if (event.code === 'Esc') {
        onClose?.();
      }
    },
    [input]
  );

  return (
    <div onKeyUp={handleKeyUp}>
      <Stack direction="column">
        <Stack direction="row" alignItems="center" spacing={2} m={2} mb={1}>
          <Typography>{option.field}</Typography>{' '}
          <Select
            size="small"
            value={operatorIdx}
            onChange={(event) => setOperatorIdx(Number(event.target.value))}
          >
            {option.operators.map(({ operator, label = operator }, i) => (
              <MenuItem key={i} value={i}>
                {label}
              </MenuItem>
            ))}
          </Select>
          <InputComponent value={input} onChange={setInput} />
        </Stack>
        <Box m={1} display="flex" justifyContent="flex-end">
          <Button onClick={onClose}>cancel</Button>
          <Button
            disabled={!input}
            onClick={() =>
              input
                ? onSubmit?.(option.operators[operatorIdx].operator, input)
                : null
            }
          >
            add
          </Button>
        </Box>
      </Stack>
    </div>
  );
}

let nextKey = 0;
const itemKeys = new WeakMap();

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
    const newItem = { field, operator, value: newValue };
    itemKeys.set(newItem, `item-${nextKey++}`);
    onChange?.([...value, newItem]);
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
      <TransitionGroup component={null}>
        {value.map((item, index) => {
          return (
            <Collapse
              orientation="horizontal"
              key={itemKeys.get(item) || index}
              in
              mountOnEnter
              unmountOnExit
            >
              <DataFilterChip
                label={item.field}
                onDelete={handleDelete(index)}
              />
            </Collapse>
          );
        })}
      </TransitionGroup>
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
