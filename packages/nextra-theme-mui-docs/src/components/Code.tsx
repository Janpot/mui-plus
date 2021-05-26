import * as React from 'react';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import { useTheme, experimentalStyled as styled } from '@material-ui/core';
import clsx from 'clsx';
import useIsMounted from '../useIsMounted';

const CLASS_HIGHLIGHT = 'NextraMuiThemeHighlight';

const Root = styled('code')(({ theme }) => ({
  whiteSpace: 'pre',
  display: 'block',
  borderRadius: theme.shape.borderRadius,
  overflow: 'scroll',
  padding: theme.spacing(2),
}));

const CodeLine = styled('div')({
  display: 'table-row',
  [`&.${CLASS_HIGHLIGHT}`]: {
    background: 'var(--c-highlight)',
    margin: '0 -1rem',
    padding: '0 1rem',
  },
});

const LineNumber = styled('span')({
  display: 'table-cell',
  textAlign: 'right',
  paddingRight: '1em',
  userSelect: 'none',
  opacity: 0.5,
});

const LineContent = styled('span')({
  display: 'table-cell',
});

export interface CodeProps {
  children: string;
  className?: string;
  language?: string;
  highlight?: number[];
  lineNumbers?: boolean;
}

export default function Code({
  children,
  language,
  className: classNameProp,
  highlight = [],
  lineNumbers,
}: CodeProps) {
  const mounted = useIsMounted();
  const theme = useTheme();

  if (!mounted) return <Root>{children}</Root>;

  // https://mdxjs.com/guides/syntax-highlighting#all-together
  return (
    <Highlight
      {...defaultProps}
      code={children.trim()}
      language={language as Language}
      theme={theme.prism}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Root className={clsx(classNameProp, className)} style={style}>
          {tokens.map((line, i) => {
            const { className, ...props } = getLineProps({ line, key: i });
            return (
              <CodeLine
                key={i}
                className={clsx(className, {
                  [CLASS_HIGHLIGHT]: highlight.includes(i + 1),
                })}
                {...props}
              >
                {lineNumbers ? <LineNumber>{i + 1}</LineNumber> : null}
                <LineContent>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </LineContent>
              </CodeLine>
            );
          })}
        </Root>
      )}
    </Highlight>
  );
}
