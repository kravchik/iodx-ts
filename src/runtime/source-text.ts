import { BitSet } from "./bit-set.js";
import { binarySearch } from "./java-helpers.js";

export interface SourceTextOptions {
  readonly startingLine?: number;
  readonly startingColumn?: number;
  readonly tabSize?: number;
}

export class SourceText {
  private readonly lineOffsets: number[] = [0];
  private readonly complexLines = new BitSet();
  private startingLine: number;
  private startingColumn: number;
  private tabSize: number;

  public constructor(
    private inputSource: string,
    private readonly content: string,
    options: SourceTextOptions = {},
  ) {
    this.startingLine = options.startingLine ?? 1;
    this.startingColumn = options.startingColumn ?? 1;
    this.tabSize = options.tabSize ?? 1;
    this.indexLines();
  }

  public setTabSize(tabSize: number): void {
    if (!Number.isInteger(tabSize) || tabSize < 1) throw new RangeError("tabSize must be positive");
    this.tabSize = tabSize;
  }

  public setStartingPos(line: number, column: number): void {
    this.startingLine = line;
    this.startingColumn = column;
  }

  public charAt(position: number): string {
    return this.content.charAt(position);
  }

  public length(): number {
    return this.content.length;
  }

  public subSequence(start: number, end: number): string {
    return this.content.slice(start, end);
  }

  public toString(): string {
    return this.content;
  }

  public getText(start: number, end: number): string {
    return this.content.slice(start, end);
  }

  public getInputSource(): string {
    return this.inputSource;
  }

  public setInputSource(inputSource: string): void {
    this.inputSource = inputSource;
  }

  public getLineStartOffset(lineNumber: number): number {
    const index = lineNumber - this.startingLine;
    if (index <= 0) return 0;
    return this.lineOffsets[index] ?? this.content.length;
  }

  public getLineEndOffset(lineNumber: number): number {
    const index = lineNumber - this.startingLine;
    if (index < 0) return 0;
    if (index >= this.lineOffsets.length) return this.content.length;
    const nextStart = this.lineOffsets[index + 1];
    return nextStart === undefined ? this.content.length - 1 : nextStart - 1;
  }

  public getLineFromOffset(offset: number): number {
    if (offset <= 0) return this.startingLine;
    if (this.content.length === 0) return this.startingLine;
    if (offset >= this.content.length) {
      const trailingLine = this.content.endsWith("\n") ? 0 : -1;
      return this.startingLine + this.lineOffsets.length + trailingLine;
    }
    const found = binarySearch(this.lineOffsets, offset);
    const index = found >= 0 ? found : -found - 2;
    return this.startingLine + Math.max(0, index);
  }

  public getCodePointColumnFromOffset(offset: number): number {
    if (offset >= this.content.length) return 1;
    if (offset <= 0) return this.startingColumn;

    const line = this.getLineFromOffset(offset) - this.startingLine;
    const lineStart = this.lineOffsets[line] ?? 0;
    const startColumn = line > 0 ? 1 : this.startingColumn;
    if (!this.complexLines.get(line)) return offset - lineStart + startColumn;

    let target = offset;
    if (isLowSurrogate(this.content.charCodeAt(target))) target -= 1;
    let column = startColumn;
    for (let index = lineStart; index < target; index += 1) {
      const codeUnit = this.content.charCodeAt(index);
      if (codeUnit === 0x09) {
        column += this.tabSize - ((column - 1) % this.tabSize);
      } else {
        column += 1;
        if (isHighSurrogate(codeUnit) && isLowSurrogate(this.content.charCodeAt(index + 1)))
          index += 1;
      }
    }
    return column;
  }

  private indexLines(): void {
    let line = 0;
    for (let index = 0; index < this.content.length; index += 1) {
      const codeUnit = this.content.charCodeAt(index);
      if (codeUnit === 0x09 || isHighSurrogate(codeUnit)) this.complexLines.set(line);
      if (codeUnit === 0x0a) {
        line += 1;
        if (index + 1 < this.content.length) this.lineOffsets.push(index + 1);
      }
    }
  }
}

export function isHighSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

export function isLowSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}
