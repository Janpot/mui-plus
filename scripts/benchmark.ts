// TODO: organize better?
import { bundle } from '../tests/utils';
import puppeteer from 'puppeteer';
import { performance } from 'perf_hooks';
import * as path from 'path';
import * as fs from 'fs/promises';
// TODO: organize better (use external math package?)
import * as math from '../packages/mui-plus/src/utils/math';

const FILES_DIR = path.resolve(__dirname, `./fps-meter/`);

async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function screenshotFpsMeter(page: puppeteer.Page, filename: string) {
  await fs.mkdir(FILES_DIR, { recursive: true });
  await page.screenshot({
    path: path.resolve(FILES_DIR, filename),
    clip: { x: 0, y: 0, width: 196, height: 185 },
  });
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
  median: number;
  mean: number;
}

function slugify(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/\-+/g, '-')
    .replace(/(^\-)|(\-$)/g, '');
}

async function measure(page: puppeteer.Page, title: string): Promise<Results> {
  // await page.tracing.start({
  //   categories: ['-*', 'disabled-by-default-devtools.timeline.frame'],
  // });

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
  await simulateScroll(page, { duration: 5000, deltaY: 100 });

  await screenshotFpsMeter(page, `fps-${title}.png`);

  // const trace = JSON.parse(await (await page.tracing.stop()).toString('utf-8'));
  // console.log(JSON.stringify(trace, null, 2));

  const fps: number[] = await page.evaluate(() => (window as any).__fps);
  const min = Math.min(...fps);
  const max = Math.max(...fps);
  const median = math.median(fps);
  const mean = math.mean(fps);
  return { fps, min, max, median, mean };
}

const formatter = new Intl.NumberFormat('en');

function printResults(results: Results) {
  console.log(`     Min: ${formatter.format(results.min)} fps`);
  console.log(`     Max: ${formatter.format(results.max)} fps`);
  console.log(`  Median: ${formatter.format(results.median)} fps`);
  console.log(`    Mean: ${formatter.format(results.mean)} fps`);
}

function printAggregatedResults(results: Results[]) {
  const mins = results.map((result) => result.min);
  const maxs = results.map((result) => result.max);
  const medians = results.map((result) => result.median);
  const means = results.map((result) => result.mean);
  const min = math.mean(mins);
  const minStd = math.std(mins);
  const max = math.mean(maxs);
  const maxStd = math.std(maxs);
  const median = math.mean(medians);
  const medianStd = math.std(medians);
  const mean = math.mean(means);
  const meanStd = math.std(means);
  console.log(
    `     Min: ${formatter.format(min)} fps (σ = ${formatter.format(minStd)})`
  );
  console.log(
    `     Max: ${formatter.format(max)} fps (σ = ${formatter.format(maxStd)})`
  );
  console.log(
    `  Median: ${formatter.format(median)} fps (σ = ${formatter.format(
      medianStd
    )})`
  );
  console.log(
    `    Mean: ${formatter.format(mean)} fps (σ = ${formatter.format(meanStd)})`
  );
}

async function measureExample(browser: puppeteer.Browser, example: string) {
  const page = await browser.newPage();
  try {
    await page.setContent(await bundle(example));
    await page.waitForFunction('window.__ready');
    const results = await measure(page, slugify(example));
    printResults(results);
    return results;
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
    return results;
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
    const allResults = [];
    console.log('local benchmark:');
    for (let i = 0; i < 10; i++) {
      const results = await measureExample(
        browser,
        './docs/examples/DataGrid/Benchmark.tsx'
      );
      console.log('');
      allResults.push(results);
    }
    console.log('');
    console.log('Aggregated:');
    printAggregatedResults(allResults);

    // for (const [title, url] of CASES) {
    //   console.log(`${title}:`);
    //   await measureUrl(browser, url);
    //   console.log('');
    // }
  } finally {
    await browser.close();
  }
}

main();
