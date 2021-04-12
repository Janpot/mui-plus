import * as React from 'react';
import ExampleHost from './components/ExampleHost';
import NextraTheme, {
  NextraOptions,
  MuiNextraThemeConfig,
  NextraRootProps,
} from './NextraTheme';

export default function createTheme(
  opts: NextraOptions,
  config: MuiNextraThemeConfig | null
) {
  return function AppRoot(props: NextraRootProps) {
    return <NextraTheme props={props} opts={opts} config={config || {}} />;
  };
}

export { ExampleHost };
