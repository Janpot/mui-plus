import * as React from 'react';
import {
  makeStyles,
  Box,
  Chip,
  Popover,
  PopoverActions,
  MenuItem,
  MenuItemProps,
  MenuList,
  Zoom,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { TransitionGroup } from 'react-transition-group';

const useStyles = makeStyles((theme) => ({
  chip: {
    margin: theme.spacing(0.5),
  },
  new: {
    borderStyle: 'dashed',
  },
}));

function isAvailable(
  option: { property: string; allowMultiple?: boolean },
  value: { property: string }[]
) {
  if (typeof option.allowMultiple === 'number') {
    return (
      value.filter((val) => val.property === option.property).length <
      option.allowMultiple
    );
  } else if (option.allowMultiple) {
    return true;
  } else {
    return !value.find((val) => val.property === option.property);
  }
}

export interface FilterEditorProps {
  label: string;
  value: any;
  onChange: (newValue: any) => void;
  onCancel: () => void;
}

export interface OptionDefinition<T = any> {
  key: string;
  label?: string;
  defaultValue?: T;
  valueLabel?: string | ((value: T, option: OptionDefinition<T>) => string);
  renderEditor?: React.ElementType;
  allowMultiple?: number;
}

type OperatorPrimitive = string | number | boolean;

interface Operator {
  operator: string;
  value: OperatorPrimitive | OperatorPrimitive[];
}

export type FilterPrimitive = string | number | boolean | Operator;

export interface KeyFilter {
  property: string;
  condition: FilterPrimitive | FilterPrimitive[];
}

export type Filter = KeyFilter[];

interface DataFilterProps {
  children?: React.ReactNode;
  value: Filter;
  onChange: (newFilter: Filter) => void;
  fixed?: number;
}

function useKeyGenerator() {
  const nextKey = React.useRef(0);
  const filterKeyMap = React.useRef(new WeakMap());

  return (value: any) => {
    const valueType = typeof value;
    if (valueType === 'object' || valueType === 'function') {
      if (filterKeyMap.current.has(value)) {
        return filterKeyMap.current.get(value);
      } else {
        const key = `${valueType}-${nextKey.current++}`;
        filterKeyMap.current.set(value, key);
        return key;
      }
    }
    return `${valueType}-${value}`;
  };
}

export interface FilterItemProps extends Omit<MenuItemProps, 'value'> {
  property: string;
  label?: string;
  condition?: FilterPrimitive | React.ElementType;
  allowMultiple?: boolean | number;
}

export function FilterItem(props: FilterItemProps) {
  const { condition, property, allowMultiple, ...menuProps } = props;
  return <MenuItem {...menuProps} button />;
}

export default function DataFilter({
  children,
  value,
  onChange,
  fixed = 0,
}: DataFilterProps) {
  const classes = useStyles();
  const popperRef = React.useRef<PopoverActions>(null);
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const [editedOption, setEditedOption] =
    React.useState<{
      property: string;
      label: string;
      renderEditor: React.ElementType;
    } | null>(null);
  const [editedIndex, setEditedIndex] = React.useState<number | null>(null);
  const menuOpen = Boolean(anchorEl);

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleCreateNew = (event: React.MouseEvent) => {
    setEditedOption(null);
    setEditedIndex(null);
    setAnchorEl(event.currentTarget);
  };

  const handleEditorClose = () => {
    setAnchorEl(null);
  };

  const handleEditorChange = (property: string, newValue: any) => {
    if (typeof editedIndex === 'number') {
      onChange(
        value.map((filterValue, index) => {
          if (index === editedIndex) {
            return {
              ...filterValue,
              value: newValue,
            };
          } else {
            return filterValue;
          }
        })
      );
      setEditedOption(null);
      setEditedIndex(null);
    } else {
      onChange([...value, { property, condition: newValue }]);
    }
    handleEditorClose();
  };

  React.useEffect(() => {
    if (anchorEl && popperRef.current) {
      popperRef.current.updatePosition();
    }
  }, [editedOption, anchorEl]);

  let hasAvailableOptions = false;
  const menuContent = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== FilterItem) {
      return null;
    }

    const { property, condition, allowMultiple, label } = child.props;

    const disabled = !isAvailable(
      {
        property,
        allowMultiple,
      },
      value
    );

    if (!disabled) {
      hasAvailableOptions = true;
    }

    return React.cloneElement(child, {
      disabled,
      onClick: () => {
        if (typeof condition === 'function') {
          setEditedOption({
            property,
            label: label || property,
            renderEditor: condition,
          });
        } else {
          const conditionValue = condition === undefined ? true : condition;
          handleEditorChange(property, conditionValue);
        }
      },
    });
  });

  const getKey = useKeyGenerator();

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      <TransitionGroup component={null}>
        {value.map((filterValue, index) => {
          const isFixed = index < fixed;
          const reactKey = getKey(filterValue);
          const label =
            typeof filterValue.condition === 'boolean'
              ? filterValue.property
              : `${filterValue.property}: ${JSON.stringify(
                  filterValue.condition
                )}`;
          return (
            <Zoom key={reactKey} in mountOnEnter unmountOnExit>
              <Chip
                className={classes.chip}
                key={index}
                label={label}
                onDelete={isFixed ? undefined : () => handleDelete(index)}
              />
            </Zoom>
          );
        })}
        {hasAvailableOptions ? (
          <Zoom in mountOnEnter unmountOnExit>
            <Chip
              className={`${classes.chip} ${classes.new}`}
              icon={<AddIcon />}
              label="Add a filter"
              variant="outlined"
              onClick={handleCreateNew}
            />
          </Zoom>
        ) : null}
      </TransitionGroup>
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
        {editedOption && editedOption.renderEditor ? (
          React.createElement(editedOption.renderEditor, {
            label: editedOption.label,
            value:
              typeof editedIndex === 'number'
                ? value[editedIndex].property
                : null,
            onChange: (newValue: any) =>
              handleEditorChange(editedOption.property, newValue),
            onCancel: handleEditorClose,
          })
        ) : (
          <MenuList dense autoFocusItem>
            {menuContent}
          </MenuList>
        )}
      </Popover>
    </Box>
  );
}
