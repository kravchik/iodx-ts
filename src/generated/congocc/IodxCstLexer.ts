/* Generated from IodxCstLexer.java by the narrow IODX Java-to-TypeScript transpiler. */

import {
  BitSet,
  charSequenceLength,
  codePointAt,
  InvalidToken,
  Token,
  TokenSet,
  TokenSource,
  TokenType,
} from "../../runtime/index.js";

const {
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
} = TokenType;

enum LexicalState {
  DEFAULT,
}

class MatchInfo {
  matchedType: TokenType = TokenType.INVALID;
  matchLength: number = 0;
}

interface MatcherHook {
  apply(
    lexicalState: LexicalState | null,
    input: string | IodxCstLexer,
    position: number,
    activeTokenTypes: TokenSet<TokenType> | null,
    nfaFunctions: NfaFunction[],
    currentStates: BitSet | null,
    nextStates: BitSet,
    matchInfo: MatchInfo | null,
  ): MatchInfo;
}

interface NfaFunction {
  apply(
    ch: number,
    bs: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null;
}

class DEFAULT {
  private static getNfaIndex0(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x22) {
      if (validTypes === null || validTypes.contains(STRING_LITERAL_DQ)) {
        nextStates.set(31);
      }
    } else if (ch === 0x27) {
      if (validTypes === null || validTypes.contains(STRING_LITERAL_SQ)) {
        nextStates.set(32);
      }
    } else if (ch === 0x2d) {
      if (validTypes === null || validTypes.contains(INTEGER_LITERAL)) {
        nextStates.set(5);
      }
      if (validTypes === null || validTypes.contains(INVALID_LEADING_ZERO_INTEGER)) {
        nextStates.set(37);
      }
      if (validTypes === null || validTypes.contains(INVALID_HEX_INTEGER)) {
        nextStates.set(38);
      }
      if (validTypes === null || validTypes.contains(FLOATING_POINT_LITERAL)) {
        nextStates.set(39);
      }
    } else if (ch === 0x2e) {
      if (validTypes === null || validTypes.contains(FLOATING_POINT_LITERAL)) {
        nextStates.set(19);
      }
    } else if (ch === 0x2f) {
      if (validTypes === null || validTypes.contains(COMMENT_SINGLE_LINE)) {
        nextStates.set(2);
      }
      if (validTypes === null || validTypes.contains(COMMENT_MULTI_LINE)) {
        nextStates.set(33);
      }
    } else if (ch === 0x30) {
      if (validTypes === null || validTypes.contains(INTEGER_LITERAL)) {
        nextStates.set(36);
      }
      if (validTypes === null || validTypes.contains(INVALID_LEADING_ZERO_INTEGER)) {
        nextStates.set(10);
      }
      if (validTypes === null || validTypes.contains(INVALID_HEX_INTEGER)) {
        nextStates.set(12);
      }
    }
    if (ch >= 0x30 && ch <= 0x39) {
      if (validTypes === null || validTypes.contains(FLOATING_POINT_LITERAL)) {
        nextStates.set(14);
      }
      if (validTypes === null || validTypes.contains(FLOATING_POINT_LITERAL)) {
        nextStates.set(42);
      }
      if (validTypes === null || validTypes.contains(FLOATING_POINT_LITERAL)) {
        nextStates.set(27);
      }
    } else if (ch === 0x2c || ch === 0x3b) {
      if (validTypes === null || validTypes.contains(ANY_SEPARATOR)) {
        type = ANY_SEPARATOR;
      }
    } else if (TokenSource.checkIntervals(DEFAULT.NFA_MOVES_64, ch)) {
      if (validTypes === null || validTypes.contains(ANY_OPERATOR)) {
        nextStates.set(30);
        type = ANY_OPERATOR;
      }
    }
    if (
      ch === 0x24 ||
      ch === 0x2e ||
      (ch >= 0x30 && ch <= 0x39) ||
      (ch >= 0x41 && ch <= 0x5a) ||
      ch === 0x5f ||
      (ch >= 0x61 && ch <= 0x7a)
    ) {
      if (validTypes === null || validTypes.contains(ANY_LITERAL)) {
        nextStates.set(29);
        type = ANY_LITERAL;
      }
    }
    if (ch === 0x30) {
      if (validTypes === null || validTypes.contains(INTEGER_LITERAL)) {
        nextStates.set(6);
        type = INTEGER_LITERAL;
      }
    } else if (ch >= 0x31 && ch <= 0x39) {
      if (validTypes === null || validTypes.contains(INTEGER_LITERAL)) {
        nextStates.set(7);
        type = INTEGER_LITERAL;
      }
    } else if (ch === 0x9) {
      if (validTypes === null || validTypes.contains(WHITE_SPACE)) {
        nextStates.set(1);
        type = WHITE_SPACE;
      }
    } else if (ch === 0xa) {
      if (validTypes === null || validTypes.contains(WHITE_SPACE)) {
        nextStates.set(1);
        type = WHITE_SPACE;
      }
    } else if (ch === 0xc) {
      if (validTypes === null || validTypes.contains(WHITE_SPACE)) {
        nextStates.set(1);
        type = WHITE_SPACE;
      }
    } else if (ch === 0xd) {
      if (validTypes === null || validTypes.contains(WHITE_SPACE)) {
        nextStates.set(1);
        type = WHITE_SPACE;
      }
    } else if (ch === 0x20) {
      if (validTypes === null || validTypes.contains(WHITE_SPACE)) {
        nextStates.set(1);
        type = WHITE_SPACE;
      }
    } else if (ch === 0x29) {
      if (validTypes === null || validTypes.contains(RIGHT_PAREN)) {
        type = RIGHT_PAREN;
      }
    } else if (ch === 0x28) {
      if (validTypes === null || validTypes.contains(LEFT_PAREN)) {
        type = LEFT_PAREN;
      }
    }
    return type;
  }

  private static getNfaIndex1(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x9) {
      nextStates.set(1);
      type = WHITE_SPACE;
    } else if (ch === 0xa) {
      nextStates.set(1);
      type = WHITE_SPACE;
    } else if (ch === 0xc) {
      nextStates.set(1);
      type = WHITE_SPACE;
    } else if (ch === 0xd) {
      nextStates.set(1);
      type = WHITE_SPACE;
    } else if (ch === 0x20) {
      nextStates.set(1);
      type = WHITE_SPACE;
    }
    return type;
  }

  private static getNfaIndex2(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x2f) {
      nextStates.set(3);
      return COMMENT_SINGLE_LINE;
    }
    return null;
  }

  private static getNfaIndex3(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if ((ch >= 0x0 && ch <= 0x9) || ch === 0xb || ch === 0xc || ch >= 0xe) {
      nextStates.set(3);
      return COMMENT_SINGLE_LINE;
    }
    return null;
  }

  private static getNfaIndex4(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if ((ch >= 0x0 && ch <= 0x29) || (ch >= 0x2b && ch <= 0x2e) || ch >= 0x30) {
      nextStates.set(35);
    } else if (ch === 0x2a) {
      nextStates.set(4);
    } else if (ch === 0x2f) {
      type = COMMENT_MULTI_LINE;
    }
    return type;
  }

  private static getNfaIndex5(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x30) {
      nextStates.set(36);
      nextStates.set(6);
      type = INTEGER_LITERAL;
    } else if (ch >= 0x31 && ch <= 0x39) {
      nextStates.set(7);
      type = INTEGER_LITERAL;
    }
    return type;
  }

  private static getNfaIndex6(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x4c || ch === 0x6c) {
      return INTEGER_LITERAL;
    }
    return null;
  }

  private static getNfaIndex7(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(7);
      type = INTEGER_LITERAL;
    } else if (ch === 0x4c || ch === 0x6c) {
      type = INTEGER_LITERAL;
    }
    return type;
  }

  private static getNfaIndex8(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if ((ch >= 0x30 && ch <= 0x39) || (ch >= 0x41 && ch <= 0x46) || (ch >= 0x61 && ch <= 0x66)) {
      nextStates.set(9);
      return INTEGER_LITERAL;
    }
    return null;
  }

  private static getNfaIndex9(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if ((ch >= 0x30 && ch <= 0x39) || (ch >= 0x41 && ch <= 0x46) || (ch >= 0x61 && ch <= 0x66)) {
      nextStates.set(9);
      type = INTEGER_LITERAL;
    } else if (ch === 0x4c || ch === 0x6c) {
      type = INTEGER_LITERAL;
    }
    return type;
  }

  private static getNfaIndex10(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(11);
      return INVALID_LEADING_ZERO_INTEGER;
    }
    return null;
  }

  private static getNfaIndex11(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(11);
      type = INVALID_LEADING_ZERO_INTEGER;
    } else if (ch === 0x4c || ch === 0x6c) {
      type = INVALID_LEADING_ZERO_INTEGER;
    }
    return type;
  }

  private static getNfaIndex12(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x58 || ch === 0x78) {
      nextStates.set(13);
      return INVALID_HEX_INTEGER;
    }
    return null;
  }

  private static getNfaIndex13(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (
      ch === 0x2e ||
      (ch >= 0x30 && ch <= 0x39) ||
      (ch >= 0x41 && ch <= 0x5a) ||
      ch === 0x5f ||
      (ch >= 0x61 && ch <= 0x7a)
    ) {
      nextStates.set(13);
      return INVALID_HEX_INTEGER;
    }
    return null;
  }

  private static getNfaIndex14(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(14);
    } else if (ch === 0x2e) {
      nextStates.set(15);
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex15(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x2d) {
      nextStates.set(40);
    } else if (ch === 0x45 || ch === 0x65) {
      nextStates.set(16);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(15);
      type = FLOATING_POINT_LITERAL;
    } else if (ch === 0x44 || ch === 0x46 || ch === 0x64 || ch === 0x66) {
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex16(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x2b || ch === 0x2d) {
      nextStates.set(17);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(18);
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex17(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(18);
      return FLOATING_POINT_LITERAL;
    }
    return null;
  }

  private static getNfaIndex18(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(18);
      type = FLOATING_POINT_LITERAL;
    } else if (ch === 0x44 || ch === 0x46 || ch === 0x64 || ch === 0x66) {
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex19(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(20);
      return FLOATING_POINT_LITERAL;
    }
    return null;
  }

  private static getNfaIndex20(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x2d) {
      nextStates.set(41);
    } else if (ch === 0x45 || ch === 0x65) {
      nextStates.set(21);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(20);
      type = FLOATING_POINT_LITERAL;
    } else if (ch === 0x44 || ch === 0x46 || ch === 0x64 || ch === 0x66) {
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex21(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x2b || ch === 0x2d) {
      nextStates.set(22);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(23);
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex22(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(23);
      return FLOATING_POINT_LITERAL;
    }
    return null;
  }

  private static getNfaIndex23(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(23);
      type = FLOATING_POINT_LITERAL;
    } else if (ch === 0x44 || ch === 0x46 || ch === 0x64 || ch === 0x66) {
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex24(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x2b || ch === 0x2d) {
      nextStates.set(25);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(26);
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex25(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(26);
      return FLOATING_POINT_LITERAL;
    }
    return null;
  }

  private static getNfaIndex26(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(26);
      type = FLOATING_POINT_LITERAL;
    } else if (ch === 0x44 || ch === 0x46 || ch === 0x64 || ch === 0x66) {
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex27(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch === 0x2d) {
      nextStates.set(44);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(27);
    } else if (ch === 0x45 || ch === 0x65) {
      nextStates.set(45);
    } else if (ch === 0x44 || ch === 0x46 || ch === 0x64 || ch === 0x66) {
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex28(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(28);
    } else if (ch === 0x44 || ch === 0x46 || ch === 0x64 || ch === 0x66) {
      type = FLOATING_POINT_LITERAL;
    }
    return type;
  }

  private static getNfaIndex29(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (
      ch === 0x24 ||
      ch === 0x2e ||
      (ch >= 0x30 && ch <= 0x39) ||
      (ch >= 0x41 && ch <= 0x5a) ||
      ch === 0x5f ||
      (ch >= 0x61 && ch <= 0x7a)
    ) {
      nextStates.set(29);
      return ANY_LITERAL;
    }
    return null;
  }

  private static getNfaIndex30(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (TokenSource.checkIntervals(DEFAULT.NFA_MOVES_64, ch)) {
      nextStates.set(30);
      return ANY_OPERATOR;
    }
    return null;
  }

  private static getNfaIndex31(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if ((ch >= 0x0 && ch <= 0x21) || (ch >= 0x23 && ch <= 0x5b) || ch >= 0x5d) {
      nextStates.set(31);
    } else if (ch === 0x5c) {
      nextStates.set(47);
    } else if (ch === 0x22) {
      type = STRING_LITERAL_DQ;
    }
    return type;
  }

  private static getNfaIndex32(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    let type: TokenType | null = null;
    if ((ch >= 0x0 && ch <= 0x26) || (ch >= 0x28 && ch <= 0x5b) || ch >= 0x5d) {
      nextStates.set(32);
    } else if (ch === 0x5c) {
      nextStates.set(48);
    } else if (ch === 0x27) {
      type = STRING_LITERAL_SQ;
    }
    return type;
  }

  private static getNfaIndex33(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x2a) {
      nextStates.set(34);
    }
    return null;
  }

  private static getNfaIndex34(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if ((ch >= 0x0 && ch <= 0x29) || ch >= 0x2b) {
      nextStates.set(34);
    } else if (ch === 0x2a) {
      nextStates.set(4);
    }
    return null;
  }

  private static getNfaIndex35(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if ((ch >= 0x0 && ch <= 0x29) || ch >= 0x2b) {
      nextStates.set(35);
    } else if (ch === 0x2a) {
      nextStates.set(4);
    }
    return null;
  }

  private static getNfaIndex36(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x58 || ch === 0x78) {
      nextStates.set(8);
    }
    return null;
  }

  private static getNfaIndex37(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x30) {
      nextStates.set(10);
    }
    return null;
  }

  private static getNfaIndex38(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x30) {
      nextStates.set(12);
    }
    return null;
  }

  private static getNfaIndex39(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x2e) {
      nextStates.set(19);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(14);
      nextStates.set(42);
      nextStates.set(27);
    }
    return null;
  }

  private static getNfaIndex40(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x45 || ch === 0x65) {
      nextStates.set(16);
    }
    return null;
  }

  private static getNfaIndex41(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x45 || ch === 0x65) {
      nextStates.set(21);
    }
    return null;
  }

  private static getNfaIndex42(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x2d) {
      nextStates.set(43);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(42);
    } else if (ch === 0x45 || ch === 0x65) {
      nextStates.set(24);
    }
    return null;
  }

  private static getNfaIndex43(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x45 || ch === 0x65) {
      nextStates.set(24);
    }
    return null;
  }

  private static getNfaIndex44(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x45 || ch === 0x65) {
      nextStates.set(45);
    }
    return null;
  }

  private static getNfaIndex45(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch === 0x2b || ch === 0x2d) {
      nextStates.set(46);
    } else if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(28);
    }
    return null;
  }

  private static getNfaIndex46(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x30 && ch <= 0x39) {
      nextStates.set(28);
    }
    return null;
  }

  private static getNfaIndex47(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x0) {
      nextStates.set(31);
    }
    return null;
  }

  private static getNfaIndex48(
    ch: number,
    nextStates: BitSet,
    validTypes: TokenSet<TokenType> | null,
    alreadyMatchedTypes: TokenSet<TokenType>,
  ): TokenType | null {
    void nextStates;
    void validTypes;
    void alreadyMatchedTypes;
    if (ch >= 0x0) {
      nextStates.set(32);
    }
    return null;
  }

  private static readonly NFA_MOVES_64: number[] = DEFAULT.NFA_MOVES_64_init();

  private static NFA_MOVES_64_init(): number[] {
    return [
      0x21, 0x21, 0x25, 0x26, 0x2a, 0x2b, 0x2d, 0x2d, 0x2f, 0x2f, 0x3c, 0x3f, 0x5e, 0x5e, 0x7c,
      0x7c,
    ];
  }

  static NFA_FUNCTIONS_init(): NfaFunction[] {
    let functions: NfaFunction[] = [
      { apply: DEFAULT.getNfaIndex0 },
      { apply: DEFAULT.getNfaIndex1 },
      { apply: DEFAULT.getNfaIndex2 },
      { apply: DEFAULT.getNfaIndex3 },
      { apply: DEFAULT.getNfaIndex4 },
      { apply: DEFAULT.getNfaIndex5 },
      { apply: DEFAULT.getNfaIndex6 },
      { apply: DEFAULT.getNfaIndex7 },
      { apply: DEFAULT.getNfaIndex8 },
      { apply: DEFAULT.getNfaIndex9 },
      { apply: DEFAULT.getNfaIndex10 },
      { apply: DEFAULT.getNfaIndex11 },
      { apply: DEFAULT.getNfaIndex12 },
      { apply: DEFAULT.getNfaIndex13 },
      { apply: DEFAULT.getNfaIndex14 },
      { apply: DEFAULT.getNfaIndex15 },
      { apply: DEFAULT.getNfaIndex16 },
      { apply: DEFAULT.getNfaIndex17 },
      { apply: DEFAULT.getNfaIndex18 },
      { apply: DEFAULT.getNfaIndex19 },
      { apply: DEFAULT.getNfaIndex20 },
      { apply: DEFAULT.getNfaIndex21 },
      { apply: DEFAULT.getNfaIndex22 },
      { apply: DEFAULT.getNfaIndex23 },
      { apply: DEFAULT.getNfaIndex24 },
      { apply: DEFAULT.getNfaIndex25 },
      { apply: DEFAULT.getNfaIndex26 },
      { apply: DEFAULT.getNfaIndex27 },
      { apply: DEFAULT.getNfaIndex28 },
      { apply: DEFAULT.getNfaIndex29 },
      { apply: DEFAULT.getNfaIndex30 },
      { apply: DEFAULT.getNfaIndex31 },
      { apply: DEFAULT.getNfaIndex32 },
      { apply: DEFAULT.getNfaIndex33 },
      { apply: DEFAULT.getNfaIndex34 },
      { apply: DEFAULT.getNfaIndex35 },
      { apply: DEFAULT.getNfaIndex36 },
      { apply: DEFAULT.getNfaIndex37 },
      { apply: DEFAULT.getNfaIndex38 },
      { apply: DEFAULT.getNfaIndex39 },
      { apply: DEFAULT.getNfaIndex40 },
      { apply: DEFAULT.getNfaIndex41 },
      { apply: DEFAULT.getNfaIndex42 },
      { apply: DEFAULT.getNfaIndex43 },
      { apply: DEFAULT.getNfaIndex44 },
      { apply: DEFAULT.getNfaIndex45 },
      { apply: DEFAULT.getNfaIndex46 },
      { apply: DEFAULT.getNfaIndex47 },
      { apply: DEFAULT.getNfaIndex48 },
    ];
    return functions;
  }
}

/* Generated by: CongoCC Parser Generator. IodxCstLexer.java  */

export class IodxCstLexer extends TokenSource {
  public constructor(
    inputOrSource: string,
    input?: string,
    lexState: LexicalState = LexicalState.DEFAULT,
    startingLine = 1,
    startingColumn = 1,
  ) {
    const inputSource = input === undefined ? "input" : inputOrSource;
    const content = input ?? inputOrSource;
    super(inputSource, content, { startingLine, startingColumn, tabSize: 1 });
    this.lexicalState = lexState;
  }

  private static MATCHER_HOOK: MatcherHook | null = null;

  // this cannot be initialized here, since hook must be set afterwards

  lexicalState: LexicalState = LexicalState.DEFAULT;
  activeTokenTypes: TokenSet<TokenType> | null = null;
  // Token types that are "regular" tokens that participate in parsing,
  // i.e. declared as TOKEN
  static readonly regularTokens: TokenSet<TokenType> = TokenSet.of(
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
  );
  // Token types that do not participate in parsing
  // i.e. declared as UNPARSED (or SPECIAL_TOKEN)
  static readonly unparsedTokens: TokenSet<TokenType> = TokenSet.noneOf<TokenType>();
  // Tokens that are skipped, i.e. SKIP
  static readonly skippedTokens: TokenSet<TokenType> = TokenSet.noneOf<TokenType>();
  // Tokens that correspond to a MORE, i.e. that are pending
  // additional input
  static readonly moreTokens: TokenSet<TokenType> = TokenSet.noneOf<TokenType>();

  /**
   * @param inputSource just the name of the input source (typically the filename)
   * that will be used in error messages and so on.
   * @param input the input
   */

  /**
   * @param inputSource just the name of the input source (typically the filename) that
   * will be used in error messages and so on.
   * @param input the input
   * @param lexState The starting lexical state, may be null to indicate the default
   * starting state
   * @param startingLine The line number at which we are starting for the purposes of location/error messages. In most
   * normal usage, this is 1.
   * @param startingColumn number at which we are starting for the purposes of location/error messages. In most normal
   * usages this is 1.
   */

  /**
   * The public method for getting the next token, that is
   * called by IodxCstParser.
   * It checks whether we have already cached
   * the token after this one. If not, it finally goes
   * to the NFA machinery
   */
  public getNextToken(
    tok: Token | null,
    requestedTokenTypes: TokenSet<TokenType> | null = this.activeTokenTypes,
  ): Token {
    if (tok === null) {
      tok = this.tokenizeAt(0, null, requestedTokenTypes);
      this.cacheToken(tok);
      return tok;
    }
    let cachedToken: Token | null = tok.nextCachedToken();
    // If the cached next token is not currently active, we
    // throw it away and go back to the IodxCstLexer
    if (
      cachedToken !== null &&
      requestedTokenTypes !== null &&
      !requestedTokenTypes.contains(cachedToken.getType())
    ) {
      this.reset(tok);
      cachedToken = null;
    }
    if (cachedToken === null) {
      let token: Token = this.tokenizeAt(tok.getEndOffset(), null, requestedTokenTypes);
      this.cacheToken(token);
      return token;
    }
    return cachedToken;
  }

  /**
   * Core tokenization method. Note that this can be called from a static context.
   * Hence the extra parameters that need to be passed in.
   */
  static getMatchInfo(
    input: string | IodxCstLexer,
    position: number,
    requestedTokenTypes: TokenSet<TokenType> | null,
    functions: NfaFunction[],
    currentStates: BitSet | null,
    nextStates: BitSet,
    matchInfo: MatchInfo | null,
  ): MatchInfo {
    if (matchInfo === null) {
      matchInfo = new MatchInfo();
    }
    if (position >= charSequenceLength(input)) {
      matchInfo.matchedType = EOF;
      matchInfo.matchLength = 0;
      return matchInfo;
    }
    let start: number = position;
    let matchLength: number = 0;
    let matchedType: TokenType = TokenType.INVALID;
    let alreadyMatchedTypes: TokenSet<TokenType> = TokenSet.noneOf<TokenType>();
    if (currentStates === null) currentStates = new BitSet(76);
    else currentStates.clear();
    if (nextStates === null) nextStates = new BitSet(76);
    else nextStates.clear();
    // the core NFA loop
    do {
      // Holder for the new type (if any) matched on this iteration
      if (position > start) {
        // What was nextStates on the last iteration
        // is now the currentStates!
        let temp: BitSet = currentStates;
        currentStates = nextStates;
        nextStates = temp;
        nextStates.clear();
      } else {
        currentStates.set(0);
      }
      if (position >= charSequenceLength(input)) {
        break;
      }
      let curChar: number = codePointAt(input, position++);
      if (curChar > 0xffff) position++;
      let nextActive: number = currentStates.nextSetBit(0);
      while (nextActive !== -1) {
        let returnedType: TokenType | null = functions[nextActive]!.apply(
          curChar,
          nextStates,
          requestedTokenTypes,
          alreadyMatchedTypes,
        );
        if (
          returnedType !== null &&
          (position - start > matchLength || returnedType < matchedType)
        ) {
          matchedType = returnedType;
          matchLength = position - start;
          alreadyMatchedTypes.add(returnedType);
        }
        nextActive = currentStates.nextSetBit(nextActive + 1);
      }
      if (position >= charSequenceLength(input)) break;
    } while (!nextStates.isEmpty());
    matchInfo.matchedType = matchedType;
    matchInfo.matchLength = matchLength;
    return matchInfo;
  }

  /**
   * @param position The position at which to tokenize.
   * @param this.lexicalState The lexical state in which to tokenize. If this is null, it is the instance variable #this.lexicalState
   * @param this.activeTokenTypes The active token types. If this is null, they are all active.
   * @return the Token at position
   */
  tokenizeAt(
    position: number,
    requestedState: LexicalState | null,
    requestedTokenTypes: TokenSet<TokenType> | null,
  ): Token {
    if (requestedState === null) requestedState = this.lexicalState;
    let tokenBeginOffset: number = position;
    let inMore: boolean = false;
    let invalidRegionStart: number = -1;
    let matchedToken: Token | null = null;
    let matchedType: TokenType | null = null;
    // The core tokenization loop
    let matchInfo: MatchInfo = new MatchInfo();
    let currentStates: BitSet = new BitSet(76);
    let nextStates: BitSet = new BitSet(76);
    while (matchedToken === null) {
      if (!inMore) tokenBeginOffset = position;
      if (IodxCstLexer.MATCHER_HOOK !== null) {
        matchInfo = IodxCstLexer.MATCHER_HOOK.apply(
          requestedState,
          this,
          position,
          requestedTokenTypes,
          IodxCstLexer.nfaFunctions,
          currentStates,
          nextStates,
          matchInfo,
        );
        if (matchInfo === null) {
          matchInfo = IodxCstLexer.getMatchInfo(
            this,
            position,
            requestedTokenTypes,
            IodxCstLexer.nfaFunctions,
            currentStates,
            nextStates,
            matchInfo,
          );
        }
      } else {
        matchInfo = IodxCstLexer.getMatchInfo(
          this,
          position,
          requestedTokenTypes,
          IodxCstLexer.nfaFunctions,
          currentStates,
          nextStates,
          matchInfo,
        );
      }
      matchedType = matchInfo.matchedType;
      inMore = IodxCstLexer.moreTokens.contains(matchedType);
      position += matchInfo.matchLength;
      if (matchedType === TokenType.INVALID) {
        if (invalidRegionStart === -1) {
          invalidRegionStart = tokenBeginOffset;
        }
        let cp: number = codePointAt(this, position);
        ++position;
        if (cp > 0xffff) ++position;
        continue;
      }
      if (invalidRegionStart !== -1) {
        return new InvalidToken(this, invalidRegionStart, tokenBeginOffset);
      }
      if (IodxCstLexer.skippedTokens.contains(matchedType)) {
        this.skipTokens(tokenBeginOffset, position);
      } else if (
        IodxCstLexer.regularTokens.contains(matchedType) ||
        IodxCstLexer.unparsedTokens.contains(matchedType)
      ) {
        matchedToken = Token.newToken(matchedType, this, tokenBeginOffset, position);
        matchedToken.setUnparsed(!IodxCstLexer.regularTokens.contains(matchedType));
      }
    }
    return matchedToken;
  }

  /**
   * Switch to specified lexical state.
   * @param lexState the lexical state to switch to
   * @return whether we switched (i.e. we weren't already in the desired lexical state)
   */
  public switchTo(lexState: LexicalState): boolean {
    if (this.lexicalState !== lexState) {
      this.lexicalState = lexState;
      return true;
    }
    return false;
  }

  // Reset the token source input
  // to just after the Token passed in.
  reset(t: Token, state: LexicalState | null = null): void {
    this.uncacheTokens(t);
    if (state !== null) {
      this.switchTo(state);
    }
  }

  // NFA related code follows.
  // The functional interface that represents
  // the acceptance method of an NFA state

  static readonly nfaFunctions: NfaFunction[] = DEFAULT.NFA_FUNCTIONS_init();
  // Initialize the various NFA method tables

  //The Nitty-gritty of the NFA code follows.
  /**
   * Holder class for NFA code related to DEFAULT lexical state
   */
}
