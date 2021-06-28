export function clamp(value: number, lower: number, upper: number): number {
  return Math.max(Math.min(value, upper), lower);
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
