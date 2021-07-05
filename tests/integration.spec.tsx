import * as esbuild from 'esbuild';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import puppeteer, { Browser } from 'puppeteer';

async function buildExample(examplePath: string) {
  const bundle = await esbuild.build({
    bundle: true,
    write: false,
    target: 'es6',
    stdin: {
      loader: 'tsx',
      resolveDir: process.cwd(),
      sourcefile: 'main.tsx',
      contents: `
        import * as ReactDOM from 'react-dom'
        import * as React from 'react';
        import {CssBaseline} from '@material-ui/core';
        import Component from '${examplePath}';
        async function main () {
          await document.fonts.ready;
          const container = document.getElementById('container')
          await new Promise(resolve => ReactDOM.render(<>
            <CssBaseline />
            <Component />
          </>, container, resolve));
          window.__ready = true;
        }
        main();
      `,
    },
  });
  const script = bundle.outputFiles[0].text;
  return `
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
        />
      </head>
      <body>
        <div style="padding:24px" id="container"></div>
        <script>
          ${script}
        </script>
      </body>
    </html>
  `;
}

expect.extend({ toMatchImageSnapshot });

let browser: Browser;
beforeAll(async () => {
  browser = await puppeteer.launch({ headless: true });
}, 20000);

afterAll(async () => {
  await browser.close();
});

const EXAMPLES: [string][] = [
  ['./docs/examples/DataFilter/Basic.tsx'],
  ['./docs/examples/DataFilter/CustomOperator.tsx'],
  ['./docs/examples/DataFilter/DifferentSizes.tsx'],
  ['./docs/examples/DataGrid/Basic.tsx'],
  ['./docs/examples/DataGrid/Controlled.tsx'],
  ['./docs/examples/DataGrid/Pinned.tsx'],
  ['./docs/examples/DataGrid/Virtualization.tsx'],
  ['./docs/examples/SelectionList/Basic.tsx'],
  ['./docs/examples/Sparkline/Basic.tsx'],
  ['./docs/examples/Sparkline/Card.tsx'],
  ['./docs/examples/Sparkline/Colors.tsx'],
  ['./docs/examples/Sparkline/Negative.tsx'],
  ['./docs/examples/Sparkbars/Basic.tsx'],
  ['./docs/examples/Sparkbars/Colors.tsx'],
  ['./docs/examples/Sparkbars/Negative.tsx'],
];

it.each(EXAMPLES)(
  'has no visual regressions in the example "%s"',
  async (examplePath) => {
    const page = await browser.newPage();
    try {
      await page.setContent(await buildExample(examplePath));
      await page.waitForFunction('window.__ready');
      const container = await page.$('#container');
      if (!container) {
        throw new Error(`Can't find #container`);
      }
      const screenshot = await container.screenshot();
      expect(screenshot).toMatchImageSnapshot();
    } finally {
      await page.close();
    }
  }
);
