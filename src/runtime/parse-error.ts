import { Caret } from "../cst/caret.js";
import { Token } from "./token.js";
import { TokenSet } from "./token-set.js";
import { TokenType, tokenTypeName } from "./token-type.js";

export class NonTerminalCall {
  public constructor(
    _parserClassName: string,
    _tokenSource: unknown,
    public readonly sourceFile: string,
    public readonly productionName: string,
    public readonly line: number,
    public readonly column: number,
  ) {}
}

export class IodxParseError extends Error {
  public readonly token: Token | null;
  public readonly range: Caret | null;
  public readonly expectedTypes: TokenSet<TokenType> | null;
  public readonly callStack: readonly NonTerminalCall[];

  public constructor();
  public constructor(message: string);
  public constructor(token: Token);
  public constructor(
    token: Token,
    expectedTypes: TokenSet<TokenType>,
    callStack?: Iterable<NonTerminalCall>,
  );
  public constructor(message: string, token: Token, callStack?: Iterable<NonTerminalCall>);
  public constructor(
    messageOrToken?: string | Token,
    tokenOrExpected?: Token | TokenSet<TokenType>,
    callStack: Iterable<NonTerminalCall> = [],
  ) {
    let message: string | undefined;
    let token: Token | null = null;
    let expectedTypes: TokenSet<TokenType> | null = null;

    if (typeof messageOrToken === "string") {
      message = messageOrToken;
      if (tokenOrExpected instanceof Token) token = tokenOrExpected;
    } else if (messageOrToken instanceof Token) {
      token = messageOrToken;
      if (tokenOrExpected instanceof TokenSet) {
        expectedTypes = tokenOrExpected;
        if (token.getType() !== TokenType.EOF && token.getNext() !== null) token = token.getNext();
      }
    }

    super(formatMessage(message, token, expectedTypes));
    this.name = "IodxParseError";
    this.token = token;
    this.range = token === null ? null : tokenRange(token);
    this.expectedTypes = expectedTypes;
    this.callStack = [...callStack];
  }

  public hitEOF(): boolean {
    return this.token?.getType() === TokenType.EOF;
  }
}

function tokenRange(token: Token): Caret {
  return new Caret(
    token.getBeginLine(),
    token.getBeginColumn(),
    token.getEndLine(),
    token.getEndColumn(),
    token.getBeginOffset(),
    token.getEndOffset(),
  );
}

function formatMessage(
  message: string | undefined,
  token: Token | null,
  expectedTypes: TokenSet<TokenType> | null,
): string {
  if (token === null && expectedTypes === null) return message ?? "IODX parse error";
  const parts = message === undefined ? [] : [message];
  parts.push(`Encountered an error at (or somewhere around) ${token?.getLocation() ?? ""}`);
  if (expectedTypes !== null) {
    parts.push(
      `Was expecting one of the following:\n${[...expectedTypes].map(tokenTypeName).join(", ")}`,
    );
  }
  if (token !== null) {
    const content = token.toString().slice(0, 32);
    const suffix = token.length() > 32 ? "..." : "";
    parts.push(
      `Found string "${escapeForMessage(content)}${suffix}" of type ${tokenTypeName(token.getType())}`,
    );
  }
  return parts.join("\n");
}

function escapeForMessage(value: string): string {
  const common: Record<string, string> = {
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    '"': '\\"',
    "'": "\\'",
    "\\": "\\\\",
  };
  let escaped = "";
  for (const character of value) {
    const replacement = common[character];
    const codePoint = character.codePointAt(0) ?? 0;
    if (replacement !== undefined) escaped += replacement;
    else if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      escaped += `\\u${codePoint.toString(16).padStart(4, "0")}`;
    } else escaped += character;
  }
  return escaped;
}

export { IodxParseError as ParseException };
