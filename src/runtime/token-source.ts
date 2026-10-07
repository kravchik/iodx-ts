import { BitSet } from "./bit-set.js";
import { binarySearch } from "./java-helpers.js";
import { SourceText, type SourceTextOptions } from "./source-text.js";
import type { Token } from "./token.js";

const skipped = Symbol("skipped-token");

export class TokenSource extends SourceText {
  private readonly tokenLocations: Array<Token | typeof skipped | undefined>;
  private readonly tokenOffsets = new BitSet();

  public constructor(inputSource: string, input: string, options: SourceTextOptions = {}) {
    super(inputSource, input, options);
    this.tokenLocations = new Array(this.length() + 1);
  }

  public cacheToken(token: Token): void {
    const begin = token.getBeginOffset();
    if (this.tokenLocations[begin] === token) return;
    const end = token.getEndOffset();
    this.tokenOffsets.set(begin);
    if (end > begin + 1) {
      this.tokenOffsets.clear(begin + 1, end);
      this.tokenLocations.fill(undefined, begin + 1, end);
    }
    this.tokenLocations[begin] = token;
  }

  public uncacheTokens(lastToken: Token): void {
    const end = lastToken.getEndOffset();
    if (end < this.tokenOffsets.length()) this.tokenOffsets.clear(end, this.tokenOffsets.length());
  }

  public nextCachedToken(offset: number): Token | null {
    const next = this.tokenOffsets.nextSetBit(offset);
    if (next === -1) return null;
    const token = this.tokenLocations[next];
    return token === undefined || token === skipped ? null : token;
  }

  public previousCachedToken(offset: number): Token | null {
    const previous = this.tokenOffsets.previousSetBit(offset - 1);
    if (previous === -1) return null;
    const token = this.tokenLocations[previous];
    return token === undefined || token === skipped ? null : token;
  }

  public skipTokens(begin: number, end: number): void {
    this.tokenLocations.fill(skipped, begin, end);
  }

  public static checkIntervals(ranges: readonly number[], codePoint: number): boolean {
    const result = binarySearch(ranges, codePoint);
    return result >= 0 || result % 2 === 0;
  }
}
