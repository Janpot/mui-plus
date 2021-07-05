import { bundle } from '../tests/utils';
import puppeteer from 'puppeteer';

async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function simulateScroll(
  page: puppeteer.Page,
  {
    duration = 0, // ms
    deltaX = 0, //px
    deltaY = 0, //px
    interval = 16, // ms
  } = {}
) {
  const startTime = Date.now();
  while (Date.now() < startTime + duration) {
    await page.mouse.wheel({ deltaX, deltaY });
    await delay(interval);
  }
}

interface Results {
  fps: number[];
  min: number;
  max: number;
  mean: number;
  avg: number;
}

async function measure(page: puppeteer.Page): Promise<Results> {
  page.evaluate(() => {
    (window as any).__fps = [];
    let lastFrameTime: number;
    const loop = (frameTime: number) => {
      if (typeof lastFrameTime === 'number') {
        const fps = 1 / ((window.performance.now() - lastFrameTime) / 1000);
        (window as any).__fps.push(fps);
      }
      lastFrameTime = frameTime;
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  });

  await page.mouse.move(200, 200);
  await simulateScroll(page, { duration: 4000, deltaY: 50 });
  // await simulateScroll(page, { duration: 5000, deltaX: 50 });

  const fps: number[] = await page.evaluate(() => (window as any).__fps);
  const min = Math.min(...fps);
  const max = Math.max(...fps);
  const mean = [...fps].sort()[Math.floor(fps.length / 2)];
  const avg = fps.reduce((a, b) => a + b, 0) / fps.length;
  return { fps, min, max, mean, avg };
}

const formatter = new Intl.NumberFormat('en');

function printResults(results: Results) {
  console.log(`      Min: ${formatter.format(results.min)} fps`);
  console.log(`      Max: ${formatter.format(results.max)} fps`);
  console.log(`     Mean: ${formatter.format(results.mean)} fps`);
  console.log(`  Average: ${formatter.format(results.avg)} fps`);
}

async function measureExample(browser: puppeteer.Browser, example: string) {
  const page = await browser.newPage();
  try {
    await page.setContent(await bundle(example));
    await page.waitForFunction('window.__ready');
    const results = await measure(page);
    printResults(results);
  } finally {
    await page.close();
  }
}

async function measureUrl(browser: puppeteer.Browser, url: string) {
  const page = await browser.newPage();
  try {
    await page.goto(url);
    await delay(1000);
    const results = await measure(page);
    printResults(results);
  } finally {
    await page.close();
  }
}

const CASES = [
  ['React Virtualized', 'https://csb-v5d0c.netlify.app/'],
  ['Mui+', 'https://csb-4xgsl.netlify.app/'],
  ['AG Grid', 'https://csb-4wb7n.netlify.app/'],
  ['XGrid', 'https://csb-6pyxl.netlify.app/'],
];

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  try {
    // await measureExample(
    //   browser,
    //   './docs/examples/DataGrid/Virtualization.tsx'
    // );

    for (const [title, url] of CASES) {
      console.log(`${title}:`);
      await measureUrl(browser, url);
      console.log('');
    }
  } finally {
    await browser.close();
  }
}

main();
