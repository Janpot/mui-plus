import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  ListItemText,
  experimentalStyled as styled,
  useControlled as useMuiControlled,
} from '@material-ui/core';
import * as React from 'react';
import { useControlled } from '../utils/useControlled';
import DragIndicator from '@material-ui/icons/DragIndicator';

const CLASS_DRAG_ITEM = 'MuiPlusListItem';
const CLASS_DRAG_HANDLE = 'MuiPlusDragHandle';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  [`.${CLASS_DRAG_HANDLE}`]: {
    color: theme.palette.divider,
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
    cursor: 'move',
    '&:hover': {
      color: theme.palette.action.active,
    },
  },
}));

interface SelectionListProps<T> {
  options?: T[];
  onOptionsChange?: (newOptions: T[]) => void;
  defaultOptions?: T[];
  value?: T[];
  onChange?: (newValue: T[]) => void;
  defaultValue?: T[];
}

function reorderList<T>(items: T[], dragIndex: number, dropIndex: number): T[] {
  if (dragIndex >= 0 && dropIndex >= 0 && dragIndex !== dropIndex) {
    const clone = [...items];
    const [elm] = clone.splice(dragIndex, 1);
    clone.splice(dropIndex, 0, elm);
    return clone;
  }
  return items;
}

export default function SelectionList<T = string>({
  options: optionsProp,
  onOptionsChange,
  defaultOptions = [],
  value: valueProp,
  onChange,
  defaultValue = [],
}: SelectionListProps<T>) {
  const listRef = React.useRef<HTMLUListElement>(null);

  const [options, setOptions] = useControlled(
    'options',
    optionsProp,
    onOptionsChange,
    defaultOptions
  );

  const [value, setValue] = useControlled(
    'value',
    valueProp,
    onChange,
    defaultValue
  );

  const handleToggle = (toggled: T) => () => {
    const items = new Set(value);
    const newValue = items.has(toggled)
      ? value.filter((item) => item !== toggled)
      : options.filter((option) => items.has(option) || toggled === option);
    setValue(newValue);
  };

  const handleDragHandleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      console.log('mouse down');
      const listItemElm = event.currentTarget.closest(
        `.${CLASS_DRAG_ITEM}`
      ) as HTMLElement | null;
      if (listItemElm) {
        listItemElm.draggable = true;
      }
    },
    []
  );

  const handleDragHandleMouseUp = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      console.log('mouse up');
      const listItemElm = event.currentTarget.closest(
        `.${CLASS_DRAG_ITEM}`
      ) as HTMLElement | null;
      if (listItemElm) {
        listItemElm.draggable = false;
      }
    },
    []
  );

  const [dragIndex, setDragIndex] = React.useState<number>(-1);
  const [dropIndex, setDropIndex] = React.useState<number>(-1);

  React.useEffect(() => {
    const listElm = listRef.current;
    if (!listElm) {
      return;
    }

    let dragIndexLocal = -1;
    let dropIndexLocal = -1;

    const getItemIndex = (itemElm: Element): number =>
      Array.from(listElm.children).indexOf(itemElm);

    const handleDragStart = (event: DragEvent) => {
      const itemElm = event.target as HTMLElement;
      if (!itemElm.classList.contains(CLASS_DRAG_ITEM)) {
        return;
      }
      dragIndexLocal = getItemIndex(itemElm);
      setDragIndex(dragIndexLocal);
      itemElm.style.opacity = '0.1';
    };

    const handleDragEnter = (event: DragEvent) => {
      const itemElm = (event.target as HTMLElement).closest(
        `.${CLASS_DRAG_ITEM}`
      );
      if (!itemElm) {
        return;
      }
      dropIndexLocal = getItemIndex(itemElm);
      setDropIndex(dropIndexLocal);
    };

    const handleDragOver = (event: DragEvent) => event.preventDefault();

    const handleDragEnd = (event: DragEvent) => {
      const itemElm = event.target as HTMLElement;
      if (!itemElm.classList.contains(CLASS_DRAG_ITEM)) {
        return;
      }
      console.log(dragIndexLocal, dropIndexLocal);
      setOptions(reorderList(options, dragIndexLocal, dropIndexLocal));
      dragIndexLocal = -1;
      setDragIndex(dragIndexLocal);
      dropIndexLocal = -1;
      setDropIndex(dropIndexLocal);
      itemElm.draggable = false;
      itemElm.style.opacity = '1';
    };

    listElm.addEventListener('dragstart', handleDragStart);
    listElm.addEventListener('dragenter', handleDragEnter);
    listElm.addEventListener('dragover', handleDragOver);
    listElm.addEventListener('dragend', handleDragEnd);
    return () => {
      listElm.removeEventListener('dragstart', handleDragStart);
      listElm.removeEventListener('dragenter', handleDragEnter);
      listElm.removeEventListener('dragover', handleDragOver);
      listElm.removeEventListener('dragend', handleDragEnd);
    };
  }, [options]);

  const optionsPreview = React.useMemo(
    () => reorderList(options, dragIndex, dropIndex),
    [options, dragIndex, dropIndex]
  );

  return (
    <div>
      <List ref={listRef}>
        {optionsPreview.map((option, i) => {
          const labelId = `checkbox-list-label-${option}`;
          const key: string = String(option);

          return (
            <StyledListItem
              data-index={i}
              className={CLASS_DRAG_ITEM}
              key={key}
              disablePadding
            >
              <ListItemButton
                role={undefined}
                onClick={handleToggle(option)}
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={value && value.indexOf(option) >= 0}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={String(option)} />
              </ListItemButton>
              <div
                className={CLASS_DRAG_HANDLE}
                onMouseDown={handleDragHandleMouseDown}
                onMouseUp={handleDragHandleMouseUp}
              >
                <DragIndicator />
              </div>
            </StyledListItem>
          );
        })}
      </List>
    </div>
  );
}
