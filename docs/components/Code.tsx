import * as React from 'react';
import Highlight, {
  defaultProps,
  Language,
  PrismTheme,
} from 'prism-react-renderer';

const THEME = {
  plain: {
    backgroundColor: 'transparent',
  },
  styles: [
    {
      types: ['keyword', 'builtin'],
      style: {
        color: '#ff0078',
        fontWeight: 'bold',
      },
    },
    {
      types: ['comment'],
      style: {
        color: '#999',
        fontStyle: 'italic',
      },
    },
    {
      types: ['variable', 'language-javascript'],
      style: {
        color: '#0076ff',
      },
    },
    {
      types: ['attr-name'],
      style: {
        color: '#d9931e',
        fontStyle: 'normal',
      },
    },
    {
      types: ['boolean', 'regex'],
      style: {
        color: '#d9931e',
      },
    },
  ],
} as PrismTheme;

export interface CodeProps {
  children: string;
  language?: string;
  highlight?: string;
}

export default function Code({
  children,
  language,
  highlight = '',
  ...props
}: CodeProps) {
  if (!language) return <code {...props}>{children}</code>;

  const highlightedLines = highlight ? highlight.split(',').map(Number) : [];

  // https://mdxjs.com/guides/syntax-highlighting#all-together
  return (
    <Highlight
      {...defaultProps}
      code={children.trim()}
      language={language as Language}
      theme={THEME}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <code className={className} style={{ ...style }}>
          {tokens.map((line, i) => (
            <div
              key={i}
              {...getLineProps({ line, key: i })}
              style={
                highlightedLines.includes(i + 1)
                  ? {
                      background: 'var(--c-highlight)',
                      margin: '0 -1rem',
                      padding: '0 1rem',
                    }
                  : undefined
              }
            >
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </code>
      )}
    </Highlight>
  );
}
