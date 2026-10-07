export class Caret {
  public readonly beginLine: number;
  public readonly beginColumn: number;

  public constructor(
    beginLine: number,
    beginColumn: number,
    public readonly endLine: number,
    public readonly endColumn: number,
    public readonly beginOffset: number,
    public readonly endOffset: number,
  ) {
    this.beginLine = beginLine === 0 ? 1 : beginLine;
    this.beginColumn = beginColumn === 0 ? 1 : beginColumn;
  }

  public static startEnd(start: Caret, end: Caret): Caret {
    return new Caret(
      start.beginLine,
      start.beginColumn,
      end.endLine,
      end.endColumn,
      start.beginOffset,
      end.endOffset,
    );
  }

  public formatBegin(): string {
    return `${this.beginLine}:${this.beginColumn}`;
  }

  public toString(): string {
    return `${this.beginLine}:${this.beginColumn} .. ${this.endLine}:${this.endColumn} [${this.beginOffset}-${this.endOffset}]`;
  }
}

export type SourceRange = Caret;
