import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";

import { IodxFloat32, IodxFloat64, IodxParseError, parseCst, tokenize } from "../dist/index.js";

const fixturesDirectory = resolve("tests/resources/upstream");

test("lexer uses longest matches and preserves text and ranges", () => {
  const source = "-0xFFL 1.5e-2d // note\n/* block */ == name";
  const tokens = tokenize(source);

  assert.deepEqual(
    tokens.map(({ type, text, beginOffset, endOffset }) => ({
      type,
      text,
      beginOffset,
      endOffset,
    })),
    [
      { type: "INTEGER_LITERAL", text: "-0xFFL", beginOffset: 0, endOffset: 6 },
      { type: "WHITE_SPACE", text: " ", beginOffset: 6, endOffset: 7 },
      { type: "FLOATING_POINT_LITERAL", text: "1.5e-2d", beginOffset: 7, endOffset: 14 },
      { type: "WHITE_SPACE", text: " ", beginOffset: 14, endOffset: 15 },
      { type: "COMMENT_SINGLE_LINE", text: "// note", beginOffset: 15, endOffset: 22 },
      { type: "WHITE_SPACE", text: "\n", beginOffset: 22, endOffset: 23 },
      { type: "COMMENT_MULTI_LINE", text: "/* block */", beginOffset: 23, endOffset: 34 },
      { type: "WHITE_SPACE", text: " ", beginOffset: 34, endOffset: 35 },
      { type: "ANY_OPERATOR", text: "==", beginOffset: 35, endOffset: 37 },
      { type: "WHITE_SPACE", text: " ", beginOffset: 37, endOffset: 38 },
      { type: "ANY_LITERAL", text: "name", beginOffset: 38, endOffset: 42 },
      { type: "EOF", text: "", beginOffset: 42, endOffset: 42 },
    ],
  );
});

test("lexer coalesces invalid regions and resumes at the next valid token", () => {
  const tokens = tokenize("@#$ name");
  assert.deepEqual(
    tokens.map(({ type, text, beginOffset, endOffset }) => [type, text, beginOffset, endOffset]),
    [
      ["INVALID", "@#", 0, 2],
      ["ANY_LITERAL", "$", 2, 3],
      ["WHITE_SPACE", " ", 3, 4],
      ["ANY_LITERAL", "name", 4, 8],
      ["EOF", "", 8, 8],
    ],
  );
});

test("all synchronized upstream fixtures have complete token coverage and parse", async () => {
  const fixtureNames = (await readdir(fixturesDirectory)).filter((name) => name.endsWith(".iodx"));
  assert.notEqual(fixtureNames.length, 0);

  for (const name of fixtureNames) {
    const source = await readFile(resolve(fixturesDirectory, name), "utf8");
    const tokens = tokenize(source);
    let offset = 0;
    for (const token of tokens) {
      assert.equal(token.beginOffset, offset, `${name}: gap before ${token.type}`);
      assert.equal(
        token.text,
        source.slice(token.beginOffset, token.endOffset),
        `${name}: token text`,
      );
      offset = token.endOffset;
    }
    assert.equal(offset, source.length, `${name}: incomplete token coverage`);
    assert.equal(tokens.at(-1)?.type, "EOF");
    parseCst(source);
  }
});

test("parseCst returns typed literal values and nested classes", () => {
  const document = parseCst(
    'Spell(active = true count = 42 id = 9223372036854775807L chance = 1.5 speed = 2d text = "open")',
  );
  const clazz = document.children[0];
  assert.equal(clazz.type, "NAMED_CLASS");
  assert.equal(clazz.childByField.get("name")?.value, "Spell");

  const values = clazz.childByField.get("body").children.map((node) => node.value);
  assert.equal(values[2], true);
  assert.equal(values[5], 42);
  assert.equal(typeof values[8], "bigint");
  assert.ok(values[11] instanceof IodxFloat32);
  assert.ok(values[14] instanceof IodxFloat64);
  assert.equal(values[17], "open");
});

test("parseCst decodes comments, strings and Unicode escapes", () => {
  const document = parseCst(
    "// heading\n/*details*/ 'old\\sscroll' \"Say \\\"open\\\"\" 'emoji: \\uD83D\\uDE00'",
  );
  assert.deepEqual(
    document.children.map(({ type, value }) => [type, value]),
    [
      ["COMMENT_SINGLE_LINE", " heading"],
      ["COMMENT_MULTI_LINE", "details"],
      ["STRING_LITERAL_SQ", "old scroll"],
      ["STRING_LITERAL_DQ", 'Say "open"'],
      ["STRING_LITERAL_SQ", "emoji: 😀"],
    ],
  );
});

test("nested class fields preserve child identity and source ranges", () => {
  const source = "outer(inner(value))";
  const outer = parseCst(source).children[0];
  const outerBody = outer.childByField.get("body");
  const inner = outerBody.children[0];
  const innerBody = inner.childByField.get("body");

  assert.equal(outer.childByField.get("name"), outer.children[0]);
  assert.equal(outerBody, outer.children[2]);
  assert.equal(inner.childByField.get("name")?.value, "inner");
  assert.equal(innerBody.children[0].value, "value");
  assert.deepEqual([outerBody.caret.beginOffset, outerBody.caret.endOffset], [5, 18]);
  assert.deepEqual([innerBody.caret.beginOffset, innerBody.caret.endOffset], [11, 17]);
});

test("empty and whitespace-only documents parse as empty lists", () => {
  for (const source of ["", " ", "\n\t"]) {
    const document = parseCst(source);
    assert.deepEqual(document.children, []);
    assert.deepEqual([document.caret.beginOffset, document.caret.endOffset], [0, source.length]);
  }
});

test("accepted and rejected syntax has stable error positions", () => {
  assert.equal(parseCst("(outer(inner(value)))").children[0].type, "UNNAMED_CLASS");

  for (const [source, offset] of [
    ["012", 0],
    ["0x", 0],
    ["hello)", 5],
    ["(", 1],
    ["valid\nvalid\n(incomplete", 23],
  ]) {
    assert.throws(
      () => parseCst(source),
      (error) => {
        assert.ok(error instanceof IodxParseError);
        assert.equal(error.token?.getBeginOffset(), offset, source);
        assert.equal(error.range?.beginOffset, offset, source);
        return true;
      },
    );
  }
});

test("literal errors retain exact source ranges", () => {
  for (const [source, offset, end, message] of [
    [String.raw`'bad\u12'`, 4, 8, /Incomplete Unicode escape/u],
    [String.raw`'bad\u12G4'`, 4, 10, /Invalid hexadecimal digit/u],
    [String.raw`'bad\uD83D'`, 4, 10, /High surrogate/u],
    [String.raw`'bad\uDE00'`, 4, 10, /Unexpected low surrogate/u],
    [String.raw`'bad\q'`, 4, 6, /Unknown escape symbol/u],
    ["2147483648", 0, 10, /Integer literal out of range/u],
  ]) {
    assert.throws(
      () => parseCst(source),
      (error) => {
        assert.ok(error instanceof IodxParseError);
        assert.match(error.message, message);
        assert.deepEqual([error.range?.beginOffset, error.range?.endOffset], [offset, end]);
        return true;
      },
    );
  }
});
