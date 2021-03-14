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
import Link from './Link';
import {
  createMuiTheme,
  createStyles,
  Theme,
  makeStyles,
  ThemeProvider,
  Collapse,
  Container,
  CssBaseline,
  IconButton,
  useTheme,
  Hidden,
  Box,
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ArrowDropUp';
import ExpandMore from '@material-ui/icons/ArrowDropDown';
import DarkIcon from '@material-ui/icons/Brightness3';
import MenuIcon from '@material-ui/icons/Menu';
import LightIcon from '@material-ui/icons/BrightnessHigh';
import { useRouter } from 'next/router';
import Slugger from 'github-slugger';
import innerText from 'react-innertext';

const LIGHT = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
  },
});

const DARK = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
  },
});

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    drawer: {
      [theme.breakpoints.up('lg')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      [theme.breakpoints.up('lg')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('lg')]: {
        display: 'none',
      },
    },
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
      overflow: 'hidden',
    },
    flexFill: {
      flex: 1,
    },
    docOutline: {
      width: 180,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'auto',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
  })
);

interface SideBarItemProps {
  level?: number;
  entry: NextraPageMapEntry;
}

function SideBarItem({ entry, ...props }: SideBarItemProps) {
  if (entry.children) {
    return <SideBarFolderItem entry={entry} {...props} />;
  } else {
    return <SideBarFileItem entry={entry} {...props} />;
  }
}

interface SideBarFileItemProps {
  level?: number;
  entry: NextraPageMapFileEntry;
}

function SideBarFileItem({ entry, level = 0 }: SideBarFileItemProps) {
  const { route } = useRouter();
  const isActive = route === entry.route;
  return (
    <ListItem
      selected={isActive}
      button
      component={Link}
      naked
      href={entry.route}
      style={{ paddingLeft: 16 + level * 16 }}
    >
      <ListItemText primary={entry.frontMatter?.title ?? entry.name} />
    </ListItem>
  );
}

interface SideBarItemListProps {
  level?: number;
  entries: PageMap;
}

function SideBarItemList({ entries, level = 0 }: SideBarItemListProps) {
  return (
    <List dense>
      {entries.map((entry) => {
        if (entry.name.startsWith('_')) {
          return null;
        }
        return <SideBarItem key={entry.name} entry={entry} level={level} />;
      })}
    </List>
  );
}

interface SideBarFolderItemProps {
  level?: number;
  entry: NextraPageMapFolderEntry;
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
        style={{ paddingLeft: 16 + level * 16 }}
      >
        <ListItemText primary={entry.frontMatter?.title ?? entry.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open}>
        <SideBarItemList entries={entry.children} level={level + 1} />
      </Collapse>
    </>
  );
}

interface LayoutProps {
  children?: React.ReactNode;
  opts: NextraOptions;
  config: MuiNextraThemeConfig;
}

function Layout({ children, opts, config }: LayoutProps) {
  const classes = useStyles();
  const theme = useTheme();
  const darkTheme = React.useContext(DarkThemeContext);
  const setDarkTheme = React.useContext(SetDarkThemeContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const slugger = new Slugger();
  const docOutline = React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) {
      return [];
    }
    const match = /^h(\d+)$/.exec(child.props.mdxType);
    if (!match) {
      return [];
    }
    const level = Number(match[1]) - 1;
    const text = innerText(child) || '';
    const slug = slugger.slug(text);
    return [{ level, text, slug }];
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          {config.logo}
        </Typography>
      </Toolbar>
      <Divider />
      <SideBarItemList entries={opts.pageMap} />
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" color="default" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <div className={classes.flexFill} />
          <IconButton onClick={() => setDarkTheme((dark) => !dark)}>
            {darkTheme ? <LightIcon /> : <DarkIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden lgUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden mdDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <Toolbar />
        <Container maxWidth="md">
          <MdxTheme>{children}</MdxTheme>
        </Container>
      </main>
      <div className={classes.docOutline}>
        <Toolbar />
        <Box padding={2}>
          <Typography component="p" variant="subtitle1">
            Content:
          </Typography>
          {docOutline.map((item) => {
            return (
              <div key={item.slug}>
                <Link href={`#${item.slug}`}>{item.text}</Link>
              </div>
            );
          })}
        </Box>
      </div>
    </div>
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
}

const DarkThemeContext = React.createContext(false);
const SetDarkThemeContext = React.createContext<
  React.Dispatch<React.SetStateAction<boolean>>
>(() => undefined);

interface NextraThemeProps {
  props: NextraRootProps;
  opts: NextraOptions;
  config: MuiNextraThemeConfig;
}

export default function NextraTheme({ props, opts, config }: NextraThemeProps) {
  const [darkTheme, setDarkTheme] = React.useState(false);
  return (
    <ThemeProvider theme={darkTheme ? DARK : LIGHT}>
      <DarkThemeContext.Provider value={darkTheme}>
        <SetDarkThemeContext.Provider value={setDarkTheme}>
          <CssBaseline />
          <Layout {...props} opts={opts} config={config || {}} />
        </SetDarkThemeContext.Provider>
      </DarkThemeContext.Provider>
    </ThemeProvider>
  );
}
