export function clamp(value: number, lower: number, upper: number): number {
  return Math.max(Math.min(value, upper), lower);
}

/**
 * Round half away from zero ('commercial' rounding)
 * Uses correction to offset floating-point inaccuracies.
 * Works symmetrically for positive and negative numbers.
 * See https://stackoverflow.com/a/48764436/419436
 */
export function round(num: number, decimalPlaces = 0): number {
  var p = Math.pow(10, decimalPlaces);
  var n = num * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
}

export function scaleLinear(
  rangeMin: number,
  rangeMax: number,
  domainMin: number,
  domainMax: number
) {
  const range = rangeMax - rangeMin;
  const domain = domainMax - domainMin;
  return (x: number): number => ((x - rangeMin) / range) * domain + domainMin;
}

export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

export function mean(numbers: number[]): number {
  return sum(numbers) / numbers.length;
}

export function median(numbers: number[]): number {
  const sorted = [...numbers].sort();
  return (
    (sorted[Math.floor(numbers.length / 2)] +
      sorted[Math.ceil(numbers.length / 2)]) /
    2
  );
}

export function std(numbers: number[]): number {
  const m = mean(numbers);
  return Math.sqrt(
    numbers.reduce((total, n) => total + (n - m) ** 2, 0) / numbers.length
  );
}
