import assert from "node:assert/strict";
import test from "node:test";

import {
  Caret,
  IodxCst,
  IodxEscapeError,
  IodxFloat32,
  IodxFloat64,
  IodxParseError,
  escapeDoubleQuotes,
  escapeSingleQuotes,
  unescape,
  unescapeQuoted,
} from "../dist/index.js";
import { IodxCstActions } from "../dist/cst/actions.js";
import { Token, TokenSource, TokenType } from "../dist/runtime/index.js";

const actions = new IodxCstActions();

function token(type, sourceText, begin = 0, end = sourceText.length) {
  const source = new TokenSource("test.iodx", sourceText);
  return new Token(type, source, begin, end);
}

test("CST actions create comments, literals and structural nodes with carets", () => {
  const comment = actions.singleLineComment(token(TokenType.COMMENT_SINGLE_LINE, "// note"));
  assert.equal(comment.type, "COMMENT_SINGLE_LINE");
  assert.equal(comment.value, " note");
  assert.deepEqual(comment.caret, new Caret(1, 1, 1, 7, 0, 7));

  const bool = actions.identifier(token(TokenType.ANY_LITERAL, "true"));
  const nil = actions.identifier(token(TokenType.ANY_LITERAL, "null"));
  assert.equal(bool.value, true);
  assert.equal(nil.value, null);

  const left = actions.structuralToken("LEFT_PAREN", token(TokenType.LEFT_PAREN, "("));
  const right = actions.structuralToken("RIGHT_PAREN", token(TokenType.RIGHT_PAREN, ")"));
  assert.equal(left.value, null);
  assert.equal(right.type, "RIGHT_PAREN");
});

test("integer actions preserve 32-bit and explicit 64-bit semantics", () => {
  assert.equal(actions.integer(token(TokenType.INTEGER_LITERAL, "2147483647")).value, 2147483647);
  assert.equal(actions.integer(token(TokenType.INTEGER_LITERAL, "-0X80000000")).value, -2147483648);

  const maximum = actions.integer(token(TokenType.INTEGER_LITERAL, "9223372036854775807L"));
  assert.equal(maximum.value, 9223372036854775807n);

  const minimum = actions.integer(token(TokenType.INTEGER_LITERAL, "-0x8000000000000000l"));
  assert.equal(minimum.value, -9223372036854775808n);
});

test("integer overflow reports the full literal range", () => {
  const literal = token(TokenType.INTEGER_LITERAL, "2147483648");
  assert.throws(
    () => actions.integer(literal),
    (error) => {
      assert.ok(error instanceof IodxParseError);
      assert.equal(error.token, literal);
      assert.match(error.message, /Integer literal out of range: 2147483648/);
      return true;
    },
  );

  assert.throws(
    () => actions.integer(token(TokenType.INTEGER_LITERAL, "0x8000000000000000L")),
    /Integer literal out of range/,
  );
});

test("floating-point actions distinguish default float32 and explicit float64", () => {
  const defaultFloat = actions.floatingPoint(token(TokenType.FLOATING_POINT_LITERAL, "3.14"));
  const explicitFloat = actions.floatingPoint(token(TokenType.FLOATING_POINT_LITERAL, "3.14f"));
  const double = actions.floatingPoint(token(TokenType.FLOATING_POINT_LITERAL, "3.14D"));

  assert.ok(defaultFloat.value instanceof IodxFloat32);
  assert.ok(explicitFloat.value instanceof IodxFloat32);
  assert.ok(double.value instanceof IodxFloat64);
  assert.equal(defaultFloat.value.value, Math.fround(3.14));
  assert.equal(double.value.value, 3.14);
});

test("string actions decode short, space and surrogate-pair escapes", () => {
  const source = '"A\\s\\uD83D\\uDE00"';
  const node = actions.string("STRING_LITERAL_DQ", token(TokenType.STRING_LITERAL_DQ, source));

  assert.equal(node.value, "A 😀");
  assert.equal(node.caret.beginOffset, 0);
  assert.equal(node.caret.endOffset, source.length);
});

test("malformed Unicode escapes retain exact source offsets", () => {
  const sourceText = '"\\u12G4"';
  assert.throws(
    () => actions.string("STRING_LITERAL_DQ", token(TokenType.STRING_LITERAL_DQ, sourceText)),
    (error) => {
      assert.ok(error instanceof IodxParseError);
      assert.equal(error.token?.getBeginOffset(), 1);
      assert.equal(error.token?.getEndOffset(), 7);
      assert.equal(error.token?.getBeginLine(), 1);
      assert.equal(error.token?.getBeginColumn(), 2);
      assert.match(error.message, /Invalid hexadecimal digit in Unicode escape at offset 1/);
      return true;
    },
  );
});

test("raw malformed surrogates are rejected", () => {
  assert.throws(
    () => unescape("\ud800"),
    (error) => {
      assert.ok(error instanceof IodxEscapeError);
      assert.equal(error.offset, 0);
      assert.equal(error.length, 1);
      return true;
    },
  );
  assert.throws(() => unescape("\udc00"), /Lone low surrogate/);
});

test("escaping matches IODX short escapes and keeps printable Unicode", () => {
  assert.equal(unescapeQuoted("'\\s\\t\\n'"), " \t\n");
  assert.equal(escapeSingleQuotes("' Ж 😀\t"), "\\' Ж 😀\\t");
  assert.equal(escapeDoubleQuotes('" Ж 😀\t'), '\\" Ж 😀\\t');
  assert.equal(escapeSingleQuotes("\u0000\u0085"), "\\u0000\\u0085");
});

test("class actions preserve child order, fields and complete range", () => {
  const name = new IodxCst("ANY_LITERAL", new Caret(1, 1, 1, 3, 0, 3), "Foo");
  const left = new IodxCst("LEFT_PAREN", new Caret(1, 4, 1, 4, 3, 4));
  const body = new IodxCst("LIST_BODY", new Caret(1, 4, 1, 5, 3, 5));
  const right = new IodxCst("RIGHT_PAREN", new Caret(1, 6, 1, 6, 5, 6));
  const node = actions.classNode(name, left, body, right);

  assert.equal(node.type, "NAMED_CLASS");
  assert.deepEqual(node.children, [name, left, body, right]);
  assert.equal(node.childByField.get("name"), name);
  assert.equal(node.childByField.get("body"), body);
  assert.deepEqual(node.caret, new Caret(1, 1, 1, 6, 0, 6));
  assert.equal(actions.requireClass(node), node);
  assert.throws(() => actions.requireClass(name), /Expected a class/);
});
