import { bundle } from './utils';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import puppeteer, { Browser } from 'puppeteer';

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
      await page.setContent(await bundle(examplePath));
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
