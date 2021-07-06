import { bundle } from '../tests/utils';
import puppeteer from 'puppeteer';
import { performance } from 'perf_hooks';
import * as path from 'path';
import * as fs from 'fs/promises';

const FPS_METER_DIR = path.resolve(__dirname, `./fps-meter/`);

async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function simulateScroll(
  page: puppeteer.Page,
  {
    duration = 0, // How long to scroll for [ms]
    deltaX = 0, // How much to scroll horizontally on each tick [px]
    deltaY = 0, // How much to scroll vertically on each tick [px]
    interval = 16, // Tick interval [ms]
    easingCycle = 0, // ease in/out scrolling in cycles of this duration [ms]
  } = {}
) {
  const startTime = Date.now();
  const cycles = easingCycle / interval;
  let i = 0;
  while (Date.now() < startTime + duration) {
    const fraction = cycles
      ? (Math.sin((2 * i * Math.PI) / cycles - Math.PI / 2) + 1) / 2
      : 1;
    i += 1;
    await Promise.race([
      page.mouse.wheel({
        deltaX: fraction * deltaX,
        deltaY: fraction * deltaY,
      }),
      delay(interval),
    ]);
  }
}

interface Results {
  fps: number[];
  min: number;
  max: number;
  mean: number;
  avg: number;
}

function slugify(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/\-+/g, '-')
    .replace(/(^\-)|(\-$)/g, '');
}

async function measure(page: puppeteer.Page, title: string): Promise<Results> {
  const devtools = await page.target().createCDPSession();
  await devtools.send('Overlay.setShowFPSCounter', { show: true });
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
  await simulateScroll(page, { duration: 10000, deltaY: 100 });
  await page.screenshot({
    path: path.resolve(FPS_METER_DIR, `./${title}.png`),
    clip: { x: 0, y: 0, width: 196, height: 185 },
  });

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
    const results = await measure(page, slugify(example));
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
    const results = await measure(page, slugify(url));
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
  await fs.mkdir(FPS_METER_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  try {
    // console.log('local benchmark:');
    // await measureExample(browser, './docs/examples/DataGrid/Benchmark.tsx');

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
