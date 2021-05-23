import {
  Collapse,
  IconButton,
  makeStyles,
  Snackbar,
  Toolbar,
} from '@material-ui/core';
import * as React from 'react';
import Code from './Code';
import CodeIcon from '@material-ui/icons/Code';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { PrismTheme } from 'prism-react-renderer';
import app from 'next/app';

const SKIPPED_PREVIEW_LINES = '// ...';

declare module '@material-ui/core' {
  interface ThemeOptions {
    prism?: PrismTheme;
  }
  interface Theme {
    prism?: PrismTheme;
  }
}

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    background:
      theme.palette.type === 'dark' ? '#333' : theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(6),
  },
  tools: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: theme.direction === 'rtl' ? 'row-reverse' : 'row',
  },
  code: {
    maxHeight: 'min(50vh, 1000px)',
  },
}));

interface ExampleHostProps {
  renderExample: () => React.ReactNode;
  code: string;
}

function isMarker(line: string, marker: string): boolean {
  const trimmed = line.trimLeft();
  return (
    trimmed.startsWith(`/// ${marker}`) ||
    trimmed.startsWith(`{/** ${marker} */}`)
  );
}

export default function ExampleHost({ renderExample, code }: ExampleHostProps) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  let previewIndentation = Infinity;
  const [fullSource, previewSource] = React.useMemo(() => {
    const lines = code.split('\n');
    const fullSourcelines: string[] = [];
    const previewSourcelines: string[] = [];
    let inPreview = false;
    for (const line of lines) {
      if (isMarker(line, 'preview-start')) {
        inPreview = true;
        if (previewSourcelines.length > 0) {
          previewSourcelines.push(SKIPPED_PREVIEW_LINES);
        }
      } else if (isMarker(line, 'preview-end')) {
        inPreview = false;
      } else {
        fullSourcelines.push(line);
        if (inPreview) {
          const indentation = line.length - line.trimLeft().length;
          if (indentation < previewIndentation) {
            previewIndentation = indentation;
          }
          previewSourcelines.push(line);
        }
      }
    }
    return [
      fullSourcelines.join('\n'),
      previewSourcelines
        .map((line) =>
          line === SKIPPED_PREVIEW_LINES ? line : line.slice(previewIndentation)
        )
        .join('\n'),
    ];
  }, [code]);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code).then(
      () => {
        setSnackbarOpen(true);
      },
      () => undefined
    );
  }, [code]);

  return (
    <div className={classes.root}>
      <div className={classes.container}>{renderExample()}</div>
      <Toolbar className={classes.tools} disableGutters>
        <IconButton onClick={() => setExpanded((expanded) => !expanded)}>
          <CodeIcon />
        </IconButton>
        <IconButton onClick={handleCopy}>
          <FileCopyIcon />
        </IconButton>
      </Toolbar>
      <Collapse in={!!previewSource || expanded}>
        <Code language="tsx" lineNumbers className={classes.code}>
          {expanded ? fullSource : previewSource}
        </Code>
      </Collapse>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="The code sample has been copied."
      />
    </div>
  );
}
