import { IodxCst } from "./cst/index.js";
import { IodxCstLexer, IodxCstParser } from "./generated/index.js";
import { TokenType, tokenTypeName } from "./runtime/token-type.js";

export interface IodxToken {
  readonly type: string;
  readonly text: string;
  readonly beginOffset: number;
  readonly endOffset: number;
  readonly beginLine: number;
  readonly beginColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
}

export function parseCst(source: string): IodxCst {
  return new IodxCstParser(source).parseDocument();
}

export function tokenize(source: string): IodxToken[] {
  const lexer = new IodxCstLexer(source);
  const result: IodxToken[] = [];
  let previous = null;
  do {
    const token = lexer.getNextToken(previous);
    result.push({
      type: tokenTypeName(token.getType()),
      text: token.toString(),
      beginOffset: token.getBeginOffset(),
      endOffset: token.getEndOffset(),
      beginLine: token.getBeginLine(),
      beginColumn: token.getBeginColumn(),
      endLine: token.getEndLine(),
      endColumn: token.getEndColumn(),
    });
    previous = token;
  } while (previous.getType() !== TokenType.EOF);
  return result;
}
