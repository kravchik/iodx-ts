export class TokenSet<T> implements Iterable<T> {
  private readonly values: Set<T>;

  public constructor(values: Iterable<T> = []) {
    this.values = new Set(values);
  }

  public static of<T>(...values: T[]): TokenSet<T> {
    return new TokenSet(values);
  }

  public static noneOf<T>(): TokenSet<T> {
    return new TokenSet<T>();
  }

  public static allOf<T>(values: Iterable<T>): TokenSet<T> {
    return new TokenSet(values);
  }

  public contains(value: T): boolean {
    return this.values.has(value);
  }

  public add(value: T): boolean {
    const changed = !this.values.has(value);
    this.values.add(value);
    return changed;
  }

  public remove(value: T): boolean {
    return this.values.delete(value);
  }

  public isEmpty(): boolean {
    return this.values.size === 0;
  }

  public clone(): TokenSet<T> {
    return new TokenSet(this.values);
  }

  public [Symbol.iterator](): SetIterator<T> {
    return this.values.values();
  }
}
