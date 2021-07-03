import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_FOLDER = path.resolve(ROOT, './docs/examples/data/');
const YEAR = 2020;
const STATION_DATA_URLS = [
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/aberporthdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/armaghdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ballypatrickdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/bradforddata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/braemardata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/cambornedata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/cambridgedata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/cardiffdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/chivenordata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/cwmystwythdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/dunstaffnagedata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/durhamdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/eastbournedata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/eskdalemuirdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/heathrowdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/hurndata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/lerwickdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/leucharsdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/lowestoftdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/manstondata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/nairndata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/newtonriggdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/oxforddata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/paisleydata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/rossonwyedata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/shawburydata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/sheffielddata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/southamptondata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/stornowaydata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/suttonboningtondata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/tireedata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/valleydata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/waddingtondata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/whitbydata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/wickairportdata.txt',
  'https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/yeoviltondata.txt',
];

function sum(...operands: number[]): number {
  return operands.reduce((a, b) => a + b, 0);
}

function parseLocation(input: string) {
  const parts = input
    .split(', ')
    .slice(1)
    .flatMap((part) => part.split(' '))
    .map((part) => part.trim());

  return {
    lat: Number(parts[1]),
    long: Number(parts[3]),
    amsl: Number(parts[4]),
  };
}

function parseValue(input: string): number | null {
  return !input || input === '---'
    ? null
    : Number(
        input.endsWith('#') || input.endsWith('*')
          ? input.slice(0, input.length - 1)
          : input
      );
}

function parseValues(lines: string[]) {
  return lines.map((line) => {
    const parts = line.trim().split(/\s+/);
    return {
      year: Number(parts[0]),
      month: Number(parts[1]),
      // Mean daily maximum temperature [degC]
      tmax: parseValue(parts[2]),
      // Mean daily minimum temperature [degC]
      tmin: parseValue(parts[3]),
      // Days of air frost [days]
      af: parseValue(parts[4]),
      // Total rainfall [mm]
      rain: parseValue(parts[5]),
      // Total sunshine duration [hours]
      sun: parseValue(parts[6]),
    };
  });
}

function pad<T>(array: T[], length: number, value: T) {
  const padding: T[] = [];
  for (let i = 0; i < length - array.length; i++) {
    padding.push(value);
  }
  return array.concat(padding);
}

function parseName(value: string): string {
  const cutOff1 = value.indexOf('/');
  const cutOff2 = value.indexOf('   ');
  return (
    cutOff1 >= 0
      ? value.slice(0, cutOff1)
      : cutOff2 >= 0
      ? value.slice(0, cutOff2)
      : value
  ).trim();
}

async function downloadStationData(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  try {
    const content = await res.text();
    const lines = content.trim().split(/\r?\n/);
    const name = parseName(lines[0]);
    const closed = lines[lines.length - 1].toLowerCase() === 'site closed';
    const tableStart = lines.findIndex((line) =>
      line.trim().startsWith('yyyy')
    );
    const table = parseValues(
      lines.slice(tableStart + 2, closed ? lines.length - 1 : lines.length)
    );
    const observedRows = table.filter((row) => row.year === YEAR);
    const tmax12 = observedRows.map((row) => row.tmax);
    const tmin12 = observedRows.map((row) => row.tmin);
    const rain12 = observedRows.map((row) => row.rain);
    const af12 = observedRows.map((row) => row.af);
    const sun12 = observedRows.map((row) => row.sun);
    const values = {
      tmax: Math.max(...tmax12.map((x) => x ?? 0)),
      tmin: Math.min(...tmax12.map((x) => x ?? Infinity)),
      rain: rain12.some((x) => x === null)
        ? null
        : sum(...rain12.map((x) => x ?? 0)),
      af: af12.some((x) => x === null) ? null : sum(...af12.map((x) => x ?? 0)),
      sun: sun12.some((x) => x === null)
        ? null
        : sum(...sun12.map((x) => x ?? 0)),
      tmax12,
      tmin12,
      rain12,
      af12,
      sun12,
    };
    return {
      name,
      closed,
      ...parseLocation(
        lines[2].startsWith('&') || lines[2].startsWith('after')
          ? lines[2]
          : lines[1]
      ),
      ...values,
    };
  } catch (err) {
    throw Object.assign(new Error(`Error parsing "${url}": ${err.message}`), {
      cause: err,
    });
  }
}

async function downloadStationsData(urls: string[]) {
  return Promise.all(urls.map((url) => downloadStationData(url)));
}

downloadStationsData(STATION_DATA_URLS).then(async (data) => {
  await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
  await fs.writeFile(
    path.resolve(OUTPUT_FOLDER, './uk-station-data.json'),
    JSON.stringify(data)
  );
});
