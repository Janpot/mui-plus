export function clamp(value: number, lower: number, upper: number): number {
  return Math.max(Math.min(value, upper), lower);
}
