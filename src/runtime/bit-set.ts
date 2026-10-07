export class BitSet {
  private words: Uint32Array;

  public constructor(size = 0) {
    this.words = new Uint32Array(Math.ceil(size / 32));
  }

  public set(bit: number): void {
    this.assertBit(bit);
    const word = bit >>> 5;
    this.ensureWord(word);
    this.words[word] = (this.words[word] ?? 0) | (1 << (bit & 31));
  }

  public get(bit: number): boolean {
    if (bit < 0) return false;
    const word = this.words[bit >>> 5];
    return word !== undefined && (word & (1 << (bit & 31))) !== 0;
  }

  public clear(): void;
  public clear(bit: number): void;
  public clear(from: number, to: number): void;
  public clear(from?: number, to?: number): void {
    if (from === undefined) {
      this.words.fill(0);
      return;
    }
    if (to === undefined) {
      if (from < 0) return;
      const word = from >>> 5;
      if (word < this.words.length) {
        this.words[word] = (this.words[word] ?? 0) & ~(1 << (from & 31));
      }
      return;
    }
    for (let bit = Math.max(0, from); bit < to; bit += 1) this.clear(bit);
  }

  public nextSetBit(from: number): number {
    for (let bit = Math.max(0, from); bit < this.words.length * 32; bit += 1) {
      if (this.get(bit)) return bit;
    }
    return -1;
  }

  public previousSetBit(from: number): number {
    for (let bit = Math.min(from, this.words.length * 32 - 1); bit >= 0; bit -= 1) {
      if (this.get(bit)) return bit;
    }
    return -1;
  }

  public isEmpty(): boolean {
    return this.words.every((word) => word === 0);
  }

  public length(): number {
    const highest = this.previousSetBit(this.words.length * 32 - 1);
    return highest + 1;
  }

  private assertBit(bit: number): void {
    if (!Number.isInteger(bit) || bit < 0) throw new RangeError(`Invalid bit index: ${bit}`);
  }

  private ensureWord(word: number): void {
    if (word < this.words.length) return;
    const expanded = new Uint32Array(word + 1);
    expanded.set(this.words);
    this.words = expanded;
  }
}
