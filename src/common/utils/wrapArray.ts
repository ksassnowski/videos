export function wrapArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
