import {
  Collapse,
  IconButton,
  Snackbar,
  Toolbar,
  Paper,
  experimentalStyled as styled,
  PaperProps,
} from '@material-ui/core';
import * as React from 'react';
import Code from './Code';
import CodeIcon from '@material-ui/icons/Code';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { PrismTheme } from 'prism-react-renderer';

const SKIPPED_PREVIEW_LINES = '// ...';

declare module '@material-ui/core' {
  interface ThemeOptions {
    prism?: PrismTheme;
  }
  interface Theme {
    prism?: PrismTheme;
  }
}

const Container = styled((props: PaperProps) => (
  <Paper variant="outlined" {...props} />
))(({ theme }) => ({
  padding: theme.spacing(3),
}));

const SrcToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  flexDirection: theme.direction === 'rtl' ? 'row-reverse' : 'row',
}));

const SrcCode = styled(Code)({
  maxHeight: 'min(50vh, 1000px)',
});

interface CodeExampleProps {
  src?: string;
  children?: React.ReactNode;
}

function isMarker(line: string, marker: string): boolean {
  const trimmed = line.trimLeft();
  return (
    trimmed.startsWith(`/// ${marker}`) ||
    trimmed.startsWith(`{/** ${marker} */}`)
  );
}

export default function CodeExample({ children, src = '' }: CodeExampleProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  let previewIndentation = Infinity;
  const [fullSource, previewSource] = React.useMemo(() => {
    const lines = src.split('\n');
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
  }, [src]);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(fullSource).then(
      () => {
        setSnackbarOpen(true);
      },
      () => undefined
    );
  }, [fullSource]);

  return (
    <div>
      <Container>{children}</Container>
      <SrcToolbar disableGutters>
        <IconButton onClick={() => setExpanded((expanded) => !expanded)}>
          <CodeIcon />
        </IconButton>
        <IconButton onClick={handleCopy}>
          <FileCopyIcon />
        </IconButton>
      </SrcToolbar>
      <Collapse in={!!previewSource || expanded}>
        <SrcCode language="tsx" lineNumbers>
          {expanded ? fullSource : previewSource}
        </SrcCode>
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
