import { MDXProvider, MDXProviderComponents } from '@mdx-js/react';
import Slugger from 'github-slugger';
import Link from './Link';
import * as React from 'react';
import { styled, Typography, TypographyProps } from '@material-ui/core';
import innerText from 'react-innertext';
import Code from '../components/Code';
import { useSection } from './useScrollSpy';
import LinkIcon from '@material-ui/icons/Link';

const Article = styled('article')(({ theme }) => ({
  '& pre code': {
    display: 'block',
  },
  '& h1': {
    ...theme.typography.h3,
    fontSize: 40,
    margin: '16px 0',
  },
  '& h2': {
    ...theme.typography.h4,
    fontSize: 30,
    margin: '40px 0 16px',
  },
  '& h3': {
    ...theme.typography.h5,
    margin: '40px 0 16px',
  },
  '& h4': {
    ...theme.typography.h6,
    margin: '32px 0 16px',
  },
  '& h5': {
    ...theme.typography.subtitle1,
    margin: '32px 0 16px',
  },
  '& h6': {
    ...theme.typography.subtitle2,
    margin: '32px 0 16px',
  },
}));

const Anchor = styled('span')({
  position: 'absolute',
  marginTop: -100,
});

const CLASS_HEADER = 'NextraMuiThemeHeader';

const HeaderLink = styled(Link)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  verticalAlign: 'middle',
  visibility: 'hidden',
  [`.${CLASS_HEADER}:hover &`]: {
    visibility: 'visible',
  },
}));

interface HeaderLinkProps extends TypographyProps {
  slugger: Slugger;
}

const Header = ({ children, slugger, ...props }: HeaderLinkProps) => {
  const slug = slugger.slug(innerText(children) || '');

  const ref = useSection(slug);

  return (
    <Typography className={CLASS_HEADER} {...props}>
      <Anchor ref={ref} id={slug} />

      {children}
      <HeaderLink href={'#' + slug} underline="none" color="inherit">
        <LinkIcon fontSize="small" />
      </HeaderLink>
    </Typography>
  );
};

function createMdxHeader(
  variant: TypographyProps['variant'],
  slugger: Slugger,
  predefinedProps?: TypographyProps
) {
  return function MdxHeader(props: TypographyProps) {
    return (
      <Header
        variant={variant}
        slugger={slugger}
        {...predefinedProps}
        {...props}
      />
    );
  };
}

function H1(props: any) {
  return <Typography variant="h1" {...props} />;
}

function CodeBlock({ className, highlight, ...props }: any) {
  return (
    <Code
      language={className ? className.slice('language-'.length) : undefined}
      highlight={highlight ? highlight.split(',').map(Number) : []}
      {...props}
    />
  );
}

function Table({ children }: any) {
  return <table>{children}</table>;
}

interface GetComponentsOptions {
  slugger: Slugger;
}

function getComponents({
  slugger,
}: GetComponentsOptions): MDXProviderComponents {
  return {
    h1: H1,
    h2: createMdxHeader('h2', slugger),
    h3: createMdxHeader('h3', slugger),
    h4: createMdxHeader('h4', slugger),
    h5: createMdxHeader('h5', slugger),
    h6: createMdxHeader('h6', slugger),
    a: Link,
    code: CodeBlock,
    table: Table,
  } as MDXProviderComponents;
}

interface MdxThemeProps {
  children?: React.ReactNode;
}

export default function MdxTheme({ children }: MdxThemeProps) {
  const slugger = new Slugger();
  return (
    <MDXProvider components={getComponents({ slugger })}>
      <Article>{children}</Article>
    </MDXProvider>
  );
}
