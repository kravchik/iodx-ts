export function binarySearch(values: readonly number[], target: number): number {
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const value = values[middle];
    if (value === undefined) break;
    if (value < target) low = middle + 1;
    else if (value > target) high = middle - 1;
    else return middle;
  }
  return -(low + 1);
}

export function codePointAt(
  input: string | { charAt(index: number): string },
  offset: number,
): number {
  const source = typeof input === "string" ? input : input.toString();
  return source.codePointAt(offset) ?? -1;
}

export function charSequenceLength(input: string | { length(): number }): number {
  return typeof input === "string" ? input.length : input.length();
}

export class CancellationError extends Error {
  public constructor(message = "Parsing cancelled") {
    super(message);
    this.name = "CancellationError";
  }
}

export class JavaList<T> implements Iterable<T> {
  private readonly values: T[] = [];

  public add(value: T): boolean {
    this.values.push(value);
    return true;
  }

  public remove(index: number): T {
    const [removed] = this.values.splice(index, 1);
    if (removed === undefined) throw new RangeError(`Invalid list index: ${index}`);
    return removed;
  }

  public get(index: number): T {
    const value = this.values[index];
    if (value === undefined) throw new RangeError(`Invalid list index: ${index}`);
    return value;
  }

  public size(): number {
    return this.values.length;
  }

  public isEmpty(): boolean {
    return this.values.length === 0;
  }

  public toArray(): T[] {
    return [...this.values];
  }

  public [Symbol.iterator](): ArrayIterator<T> {
    return this.values.values();
  }
}

export class JavaMap<K, V> {
  private readonly values = new Map<K, V>();

  public put(key: K, value: V): V | undefined {
    const previous = this.values.get(key);
    this.values.set(key, value);
    return previous;
  }

  public get(key: K): V | undefined {
    return this.values.get(key);
  }

  public containsKey(key: K): boolean {
    return this.values.has(key);
  }
}
