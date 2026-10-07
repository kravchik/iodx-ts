export enum TokenType {
  EOF,
  LEFT_PAREN,
  RIGHT_PAREN,
  WHITE_SPACE,
  COMMENT_SINGLE_LINE,
  COMMENT_MULTI_LINE,
  INTEGER_LITERAL,
  INVALID_LEADING_ZERO_INTEGER,
  INVALID_HEX_INTEGER,
  FLOATING_POINT_LITERAL,
  ANY_LITERAL,
  ANY_OPERATOR,
  ANY_SEPARATOR,
  STRING_LITERAL_DQ,
  STRING_LITERAL_SQ,
  DUMMY,
  INVALID,
}

const literalStrings: Partial<Record<TokenType, string>> = {
  [TokenType.LEFT_PAREN]: "(",
  [TokenType.RIGHT_PAREN]: ")",
};

export const allTokenTypes = Object.freeze(
  Object.values(TokenType).filter((value): value is TokenType => typeof value === "number"),
);

export function tokenTypeLiteral(type: TokenType): string | undefined {
  return literalStrings[type];
}

export function tokenTypeName(type: TokenType): string {
  return TokenType[type] ?? `TokenType(${type})`;
}
