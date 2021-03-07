import * as React from 'react';
import { Box, TextField, Button } from '@material-ui/core';
import { FilterEditorProps } from './DataFilter';

export function TextEditor({
  label,
  value,
  onChange,
  onCancel,
}: FilterEditorProps) {
  const inputRef = React.useRef<HTMLInputElement>();
  const [input, setInput] = React.useState(value ? value : '');
  const disabled = !input;
  const handleSumbit = () => onChange(input);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (!disabled) {
          handleSumbit();
        }
        return;
      case 'Esc':
        return onCancel();
      default:
        return;
    }
  };
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);
  return (
    <Box margin={1} display="flex" flexDirection="column" minWidth={150}>
      <TextField
        inputRef={inputRef}
        autoFocus
        label={label}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
      />
      <Box marginTop={1} alignSelf="flex-end">
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
