import type { TokenSource } from "./token-source.js";
import { TokenType, tokenTypeLiteral } from "./token-type.js";

export class Token {
  private unparsed = false;

  public constructor(
    private type: TokenType = TokenType.DUMMY,
    private tokenSource: TokenSource | null = null,
    private beginOffset = 0,
    private endOffset = 0,
  ) {}

  public static newToken(
    type: TokenType,
    tokenSource: TokenSource | null,
    beginOffset = 0,
    endOffset = 0,
  ): Token {
    return new Token(type, tokenSource, beginOffset, endOffset);
  }

  public truncate(amount: number): void {
    this.endOffset = Math.max(this.beginOffset, this.endOffset - amount);
  }

  public getType(): TokenType {
    return this.type;
  }

  public setType(type: TokenType): void {
    this.type = type;
  }

  public getTokenSource(): TokenSource | null {
    return this.tokenSource;
  }

  public setTokenSource(tokenSource: TokenSource): void {
    this.tokenSource = tokenSource;
  }

  public getBeginOffset(): number {
    return this.beginOffset;
  }

  public setBeginOffset(offset: number): void {
    this.beginOffset = offset;
  }

  public getEndOffset(): number {
    return this.endOffset;
  }

  public setEndOffset(offset: number): void {
    this.endOffset = offset;
  }

  public getBeginLine(): number {
    return this.tokenSource?.getLineFromOffset(this.beginOffset) ?? 0;
  }

  public getEndLine(): number {
    return this.tokenSource?.getLineFromOffset(this.endOffset - 1) ?? 0;
  }

  public getBeginColumn(): number {
    return this.tokenSource?.getCodePointColumnFromOffset(this.beginOffset) ?? 0;
  }

  public getEndColumn(): number {
    return this.tokenSource?.getCodePointColumnFromOffset(this.endOffset - 1) ?? 0;
  }

  public getInputSource(): string {
    return this.tokenSource?.getInputSource() ?? "input";
  }

  public isInvalid(): boolean {
    return this.type === TokenType.INVALID;
  }

  public isVirtual(): boolean {
    return this.type === TokenType.EOF;
  }

  public isSkipped(): boolean {
    return false;
  }

  public isUnparsed(): boolean {
    return this.unparsed;
  }

  public setUnparsed(unparsed: boolean): void {
    this.unparsed = unparsed;
  }

  public getNext(): Token | null {
    let token = this.nextCachedToken();
    while (token?.isUnparsed()) token = token.nextCachedToken();
    return token;
  }

  public getPrevious(): Token | null {
    let token = this.previousCachedToken();
    while (token?.isUnparsed()) token = token.previousCachedToken();
    return token;
  }

  public nextCachedToken(): Token | null {
    if (this.type === TokenType.EOF) return null;
    return this.tokenSource?.nextCachedToken(this.endOffset) ?? null;
  }

  public previousCachedToken(): Token | null {
    return this.tokenSource?.previousCachedToken(this.beginOffset) ?? null;
  }

  public replaceType(type: TokenType): Token {
    const replacement = new Token(type, this.tokenSource, this.beginOffset, this.endOffset);
    this.tokenSource?.cacheToken(replacement);
    return replacement;
  }

  public getSource(): string | null {
    if (this.type === TokenType.EOF) return "";
    if (this.tokenSource === null) return null;
    return this.tokenSource.getText(this.beginOffset, this.endOffset);
  }

  public getLocation(): string {
    return `${this.getInputSource()}:${this.getBeginLine()}:${this.getBeginColumn()}`;
  }

  public length(): number {
    return this.endOffset - this.beginOffset;
  }

  public subSequence(start: number, end: number): string {
    return this.requireSource().subSequence(this.beginOffset + start, this.beginOffset + end);
  }

  public charAt(offset: number): string {
    return this.requireSource().charAt(this.beginOffset + offset);
  }

  public toString(): string {
    return this.getSource() ?? tokenTypeLiteral(this.type) ?? "";
  }

  private requireSource(): TokenSource {
    if (this.tokenSource === null) throw new Error("Token has no source");
    return this.tokenSource;
  }
}

export class InvalidToken extends Token {
  public constructor(source: TokenSource, beginOffset: number, endOffset: number) {
    super(TokenType.INVALID, source, beginOffset, endOffset);
  }
}
