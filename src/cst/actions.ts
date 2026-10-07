import { IodxParseError } from "../runtime/parse-error.js";
import { Token } from "../runtime/token.js";
import { TokenType } from "../runtime/token-type.js";
import { Caret } from "./caret.js";
import { IodxCst } from "./cst.js";
import { IodxEscapeError, unescapeQuoted } from "./escaping.js";
import { IodxFloat32, IodxFloat64 } from "./numbers.js";

const int32Min = -0x80000000n;
const int32Max = 0x7fffffffn;
const int64Min = -0x8000000000000000n;
const int64Max = 0x7fffffffffffffffn;

export class IodxCstActions {
  public beginNode(token: Token): Caret {
    if (token.getType() === TokenType.DUMMY) return new Caret(1, 1, 0, 0, 0, -1);
    return new Caret(
      token.getBeginLine(),
      token.getBeginColumn(),
      0,
      0,
      token.getBeginOffset(),
      -1,
    );
  }

  public newList(): IodxCst[] {
    return [];
  }

  public listAdd(list: IodxCst[], value: IodxCst): void {
    list.push(value);
  }

  public listBody(start: Caret, children: IodxCst[], endToken: Token): IodxCst {
    return new IodxCst("LIST_BODY", this.finishNode(start, endToken), null, children);
  }

  public singleLineComment(token: Token): IodxCst {
    return new IodxCst("COMMENT_SINGLE_LINE", this.tokenCaret(token), token.toString().slice(2));
  }

  public multiLineComment(token: Token): IodxCst {
    return new IodxCst("COMMENT_MULTI_LINE", this.tokenCaret(token), token.toString().slice(2, -2));
  }

  public integer(token: Token): IodxCst {
    const literal = token.toString();
    const isInt64 = /[lL]$/u.test(literal);
    const numberText = isInt64 ? literal.slice(0, -1) : literal;
    const negative = numberText.startsWith("-");
    const unsigned = negative ? numberText.slice(1) : numberText;
    const hexadecimal = /^0[xX]/u.test(unsigned);
    const digits = hexadecimal ? unsigned.slice(2) : unsigned;

    let value: bigint;
    try {
      if (digits.length === 0) throw new SyntaxError("missing digits");
      value = BigInt(hexadecimal ? `0x${digits}` : digits);
      if (negative) value = -value;
    } catch {
      throw this.integerError(literal, token);
    }

    const min = isInt64 ? int64Min : int32Min;
    const max = isInt64 ? int64Max : int32Max;
    if (value < min || value > max) throw this.integerError(literal, token);
    return new IodxCst("INTEGER_LITERAL", this.tokenCaret(token), isInt64 ? value : Number(value));
  }

  public floatingPoint(token: Token): IodxCst {
    const literal = token.toString();
    const suffix = literal.at(-1)?.toLowerCase();
    const numberText = suffix === "f" || suffix === "d" ? literal.slice(0, -1) : literal;
    const value = Number(numberText);
    if (Number.isNaN(value)) {
      throw new IodxParseError(`Invalid floating-point literal: ${literal}`, token);
    }
    return new IodxCst(
      "FLOATING_POINT_LITERAL",
      this.tokenCaret(token),
      suffix === "d" ? new IodxFloat64(value) : new IodxFloat32(value),
    );
  }

  public rawToken(type: string, token: Token): IodxCst {
    return new IodxCst(type, this.tokenCaret(token), token.toString());
  }

  public structuralToken(type: string, token: Token): IodxCst {
    return new IodxCst(type, this.tokenCaret(token));
  }

  public string(type: string, token: Token): IodxCst {
    try {
      return new IodxCst(type, this.tokenCaret(token), unescapeQuoted(token.toString()));
    } catch (error) {
      if (!(error instanceof IodxEscapeError)) throw error;
      const begin = token.getBeginOffset() + 1 + error.offset;
      const contentEnd = token.getEndOffset() - 1;
      const end = Math.min(contentEnd, begin + error.length);
      const errorToken = Token.newToken(
        TokenType.INVALID,
        token.getTokenSource(),
        begin,
        Math.max(begin + 1, end),
      );
      throw new IodxParseError(`${error.message} at offset ${begin}`, errorToken);
    }
  }

  public identifier(token: Token): IodxCst {
    const text = token.toString();
    let value: string | boolean | null = text;
    if (text === "true") value = true;
    else if (text === "false") value = false;
    else if (text === "null") value = null;
    return new IodxCst("ANY_LITERAL", this.tokenCaret(token), value);
  }

  public classNode(name: IodxCst | null, left: IodxCst, body: IodxCst, right: IodxCst): IodxCst {
    const children = name === null ? [left, body, right] : [name, left, body, right];
    const fields = new Map<string, IodxCst>([["body", body]]);
    if (name !== null) fields.set("name", name);
    const startCaret = (name ?? left).caret;
    if (startCaret === null || right.caret === null) {
      throw new Error("Parser-created class nodes require source carets");
    }
    return new IodxCst(
      name === null ? "UNNAMED_CLASS" : "NAMED_CLASS",
      Caret.startEnd(startCaret, right.caret),
      null,
      children,
      fields,
    );
  }

  public requireClass(node: IodxCst): IodxCst {
    if (node.type === "NAMED_CLASS") return node;
    throw new IodxParseError(`Expected a class, but got: ${node.type}`);
  }

  private finishNode(start: Caret, token: Token): Caret {
    if (token.getType() === TokenType.DUMMY || token.getType() === TokenType.EOF) {
      return new Caret(
        start.beginLine,
        start.beginColumn,
        start.beginLine,
        start.beginColumn,
        start.beginOffset,
        start.beginOffset,
      );
    }
    return new Caret(
      start.beginLine,
      start.beginColumn,
      token.getEndLine(),
      token.getEndColumn(),
      start.beginOffset,
      token.getEndOffset(),
    );
  }

  private tokenCaret(token: Token): Caret {
    return new Caret(
      token.getBeginLine(),
      token.getBeginColumn(),
      token.getEndLine(),
      token.getEndColumn(),
      token.getBeginOffset(),
      token.getEndOffset(),
    );
  }

  private integerError(literal: string, token: Token): IodxParseError {
    return new IodxParseError(`Integer literal out of range: ${literal}`, token);
  }
}
