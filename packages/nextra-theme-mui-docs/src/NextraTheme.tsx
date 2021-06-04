import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MdxTheme from './MdxTheme';
import Link from './components/Link';
import {
  createTheme,
  experimentalStyled as styled,
  ThemeProvider as MuiThemeProvider,
  Collapse,
  Container,
  CssBaseline,
  IconButton,
  useTheme as useMuiTheme,
  Box,
} from '@material-ui/core';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import DarkIcon from '@material-ui/icons/Brightness3';
import MenuIcon from '@material-ui/icons/Menu';
import LightIcon from '@material-ui/icons/BrightnessHigh';
import { useRouter } from 'next/router';
import Slugger from 'github-slugger';
import innerText from 'react-innertext';
import { ScrollSpyProvider, useActiveSection } from './useScrollSpy';
import clsx from 'clsx';
import prismLight from 'prism-react-renderer/themes/duotoneLight';
import prismDark from 'prism-react-renderer/themes/vsDark';
import { PrismTheme } from 'prism-react-renderer';
import GitHubIcon from '@material-ui/icons/GitHub';
import { ThemeProvider, useTheme as useNextTheme } from 'next-themes';
import useIsMounted from './useIsMounted';
import Head from 'next/head';

declare module '@material-ui/core' {
  interface ThemeOptions {
    prism?: PrismTheme;
  }
  interface Theme {
    prism?: PrismTheme;
  }
}

const LIGHT = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0097a7',
    },
    secondary: {
      main: '#19857b',
    },
  },
  prism: prismLight,
});

const DARK = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0097a7',
    },
    secondary: {
      main: '#19857b',
    },
  },
  prism: prismDark,
});

const drawerWidth = 240;

const LayoutRoot = styled('div')({
  display: 'flex',
});

const DocsNavigation = styled('nav')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    width: drawerWidth,
    flexShrink: 0,
  },
}));

const DocsMain = styled('main')(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  overflow: 'hidden',
}));

const DocsHeader = styled(AppBar)(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
}));

const DocsOutline = styled('nav')(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const CLASS_ACTIVE = 'NextraMuiThemeActive';

const DocsOutlineSection = styled('div')(({ theme }) => ({
  // ...theme.typography.body2,
  borderLeft: `2px solid transparent`,
  color: theme.palette.text.disabled,
  [`&.${CLASS_ACTIVE}`]: {
    borderLeft: `2px solid ${theme.palette.divider}`,
  },
}));

const FlexFill = styled('div')({ flex: 1 });

const DocsMenuButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

const DocsDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
  },
});

const DrawerListItemText = styled(ListItemText)(({ styleProps }) => ({
  '& .MuiListItemText-primary':
    // @ts-expect-error
    styleProps?.level <= 0 ? { fontWeight: 'bold' } : {},
}));

interface SideBarItemProps {
  level?: number;
  entry: SiteStructureEntry;
}

function SideBarItem({ entry, ...props }: SideBarItemProps) {
  if (entry.children.length > 0) {
    return <SideBarFolderItem entry={entry} {...props} />;
  } else {
    return <SideBarFileItem entry={entry} {...props} />;
  }
}

interface SideBarFileItemProps {
  level?: number;
  entry: SiteStructureEntry;
}

function SideBarFileItem({ entry, level = 0 }: SideBarFileItemProps) {
  const { route } = useRouter();
  const isActive = route === entry.route;
  return (
    <ListItem
      selected={isActive}
      button
      component={Link}
      noLinkStyle
      href={entry.route}
      style={{ paddingLeft: 8 + level * 16 + 24 }}
    >
      <DrawerListItemText styleProps={{ level }} primary={entry.title} />
    </ListItem>
  );
}

interface SideBarItemListProps {
  level?: number;
  entries: SiteStructureEntry[];
}

function SideBarItemList({ entries, level = 0 }: SideBarItemListProps) {
  return (
    <List dense>
      {entries.map((entry) => (
        <SideBarItem key={entry.name} entry={entry} level={level} />
      ))}
    </List>
  );
}

interface SideBarFolderItemProps {
  level?: number;
  entry: SiteStructureEntry;
}

function SideBarFolderItem({ entry, level = 0 }: SideBarFolderItemProps) {
  const { route } = useRouter();
  const isOpen = route === entry.route || route.startsWith(entry.route + '/');
  const [open, setOpen] = React.useState(isOpen);

  return (
    <>
      <ListItem
        button
        onClick={() => setOpen((open) => !open)}
        style={{ paddingLeft: 8 + level * 16 }}
      >
        {open ? <ArrowDropDown /> : <ArrowRight />}
        <DrawerListItemText styleProps={{ level }} primary={entry.title} />
      </ListItem>
      <Collapse in={open}>
        <SideBarItemList entries={entry.children} level={level + 1} />
      </Collapse>
    </>
  );
}

function useTheme() {
  const { theme, setTheme } = useNextTheme();
  const mounted = useIsMounted();
  return {
    theme: mounted ? theme : undefined,
    setTheme,
  };
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <IconButton
      disabled={theme === undefined}
      onClick={toggleTheme}
      color="inherit"
    >
      {theme === 'dark' ? <LightIcon /> : <DarkIcon />}
    </IconButton>
  );
}

interface LayoutProps {
  children?: React.ReactNode;
  opts: NextraOptions;
  config: MuiNextraThemeConfig;
}

function Layout({ children, opts, config }: LayoutProps) {
  const muiTheme = useMuiTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const slugger = new Slugger();
  const minLevel = 1;
  const docOutline = React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) {
      return [];
    }
    const match = /^h(\d+)$/.exec(child.props.mdxType);
    if (!match) {
      return [];
    }
    const level = Number(match[1]) - 1;
    if (level < minLevel) {
      return [];
    }
    const text = innerText(child) || '';
    const slug = slugger.slug(text);
    return [{ level, text, slug }];
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const activeSection = useActiveSection();

  const pageMap = React.useMemo(
    () => parsePageMap(opts.pageMap),
    [opts.pageMap]
  );

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          {config.logo}
        </Typography>
      </Toolbar>
      <Divider />
      <SideBarItemList entries={pageMap} />
    </div>
  );

  return (
    <LayoutRoot>
      <CssBaseline />
      {/* TODO: color behavior will be default in future version */}
      <DocsHeader
        position="fixed"
        color={muiTheme.palette.mode === 'light' ? 'primary' : 'default'}
      >
        <Toolbar>
          <DocsMenuButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </DocsMenuButton>
          <FlexFill />
          <Box mr={2}>{config.search}</Box>
          {config.repository && (
            <IconButton
              component={Link}
              noLinkStyle
              href={config.repository}
              color="inherit"
            >
              <GitHubIcon />
            </IconButton>
          )}
          <ThemeSwitcher />
        </Toolbar>
      </DocsHeader>
      <DocsNavigation>
        <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
          <DocsDrawer
            variant="temporary"
            anchor={muiTheme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </DocsDrawer>
        </Box>
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <DocsDrawer variant="permanent" open>
            {drawer}
          </DocsDrawer>
        </Box>
      </DocsNavigation>
      <DocsMain>
        <Toolbar />
        <Container maxWidth="md">
          <MdxTheme>{children}</MdxTheme>
        </Container>
      </DocsMain>
      <DocsOutline>
        {docOutline.length > 0 ? (
          <>
            <Toolbar />
            <Box padding={2}>
              <Typography variant="subtitle1">Content:</Typography>
              {docOutline.map(({ level, slug, text }) => {
                const isACtive = slug === activeSection;
                return (
                  <DocsOutlineSection
                    className={clsx({ [CLASS_ACTIVE]: isACtive })}
                    key={slug}
                    style={{ paddingLeft: 8 + (level - minLevel) * 8 }}
                  >
                    <Link
                      href={`#${slug}`}
                      color={isACtive ? 'primary' : 'inherit'}
                    >
                      {text}
                    </Link>
                  </DocsOutlineSection>
                );
              })}
            </Box>
          </>
        ) : null}
      </DocsOutline>
    </LayoutRoot>
  );
}

type PageMap = NextraPageMapEntry[];

interface NextraPageMapEntryBase {
  name: string;
  route: string;
  frontMatter?: any;
}

interface NextraPageMapFileEntry extends NextraPageMapEntryBase {
  children?: undefined;
}

interface NextraPageMapFolderEntry extends NextraPageMapEntryBase {
  children: PageMap;
}

type NextraPageMapEntry = NextraPageMapFileEntry | NextraPageMapFolderEntry;

export interface NextraOptions {
  filename: string;
  route: string;
  meta: any;
  pageMap: PageMap;
}

export interface NextraRootProps {
  children?: React.ReactNode;
}

export interface MuiNextraThemeConfig {
  logo?: React.ReactNode;
  search?: React.ReactNode;
  title?: string;
  repository?: string;
}

interface MuiThemedContentProps {
  children?: React.ReactNode;
}

function MuiThemedContent({ children }: MuiThemedContentProps) {
  const { theme } = useTheme();
  return (
    <MuiThemeProvider theme={theme === 'dark' ? DARK : LIGHT}>
      {children}
    </MuiThemeProvider>
  );
}

interface NextraThemeProps {
  props: NextraRootProps;
  opts: NextraOptions;
  config: MuiNextraThemeConfig;
}

function parseOrder(input: unknown): { name: string; title?: string }[] {
  const result = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') {
        result.push({ name: item });
      } else if (
        item &&
        typeof item === 'object' &&
        typeof item.name === 'string'
      ) {
        result.push({
          name: item.name as string,
          frontMatter: {
            title: typeof item.title === 'string' ? item.title : undefined,
          },
        });
      }
    }
  }
  return result;
}

interface SiteStructureEntry {
  name: string;
  title: string;
  route: string;
  children: SiteStructureEntry[];
}

function parsePageMap(pageMap: PageMap): SiteStructureEntry[] {
  const entryMap = new Map(pageMap.map((entry) => [entry.name, entry]));
  const indexEntry = entryMap.get('index');
  const order = parseOrder(indexEntry?.frontMatter?.order);
  const orderedEntryNames = new Set(order.map((entry) => entry.name));
  const orderedEntries = order.map((orderEntry) => ({
    ...orderEntry,
    ...entryMap.get(orderEntry.name),
  }));
  const unorderedEntries = pageMap.filter(
    (entry) => !orderedEntryNames.has(entry.name)
  );
  const allEntries = [...orderedEntries, ...unorderedEntries].filter(
    Boolean
  ) as NextraPageMapEntry[];
  return allEntries
    .map((entry) =>
      entry.children
        ? {
            name: entry.name,
            title: entry.frontMatter?.title ?? entry.name,
            route: entry.route,
            children: parsePageMap(entry.children),
          }
        : {
            name: entry.name,
            title: entry.frontMatter?.title ?? entry.name,
            route: entry.route,
            children: [],
          }
    )
    .filter(
      (entry) =>
        !entry.name.startsWith('_') &&
        entry.route !== '/api' &&
        !entry.route.startsWith('/api/')
    );
}

export default function NextraTheme({ props, opts, config }: NextraThemeProps) {
  return (
    <>
      <CssBaseline />
      <ThemeProvider>
        <MuiThemedContent>
          <Head>
            <title>{config.title}</title>
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width"
            />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
            />
          </Head>
          <ScrollSpyProvider>
            <Layout {...props} opts={opts} config={config || {}} />
          </ScrollSpyProvider>
        </MuiThemedContent>
      </ThemeProvider>
    </>
  );
}
