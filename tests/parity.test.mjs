import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import { IodxFloat32, IodxFloat64, IodxParseError, parseCst, tokenize } from "../dist/index.js";

const parityDirectory = resolve("tests/resources/parity");
const fixtureDirectory = resolve("tests/resources/upstream");
const tokenTypeNames = [
  "EOF",
  "LEFT_PAREN",
  "RIGHT_PAREN",
  "WHITE_SPACE",
  "COMMENT_SINGLE_LINE",
  "COMMENT_MULTI_LINE",
  "INTEGER_LITERAL",
  "INVALID_LEADING_ZERO_INTEGER",
  "INVALID_HEX_INTEGER",
  "FLOATING_POINT_LITERAL",
  "ANY_LITERAL",
  "ANY_OPERATOR",
  "ANY_SEPARATOR",
  "STRING_LITERAL_DQ",
  "STRING_LITERAL_SQ",
  "DUMMY",
  "INVALID",
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function sourceFor(entry) {
  if (entry.source !== undefined) return entry.source;
  return readFile(resolve(fixtureDirectory, entry.fixture), "utf8");
}

function normalizeValue(value) {
  if (typeof value === "bigint") return { kind: "int64", value: value.toString() };
  if (value instanceof IodxFloat32) return { kind: "float32", value: value.value };
  if (value instanceof IodxFloat64) return { kind: "float64", value: value.value };
  if (value === null) return { kind: "null" };
  if (typeof value === "number") return { kind: "int32", value };
  return { kind: typeof value, value };
}

function normalizeCst(node) {
  const fields = {};
  for (const name of [...node.childByField.keys()].sort()) {
    fields[name] = node.children.indexOf(node.childByField.get(name));
  }
  return {
    type: node.type,
    caret:
      node.caret === null
        ? null
        : {
            beginLine: node.caret.beginLine,
            beginColumn: node.caret.beginColumn,
            endLine: node.caret.endLine,
            endColumn: node.caret.endColumn,
            beginOffset: node.caret.beginOffset,
            endOffset: node.caret.endOffset,
          },
    value: normalizeValue(node.value),
    children: node.children.map(normalizeCst),
    fields,
  };
}

function normalizeErrorToken(token) {
  if (token === null) return null;
  return {
    type: tokenTypeNames[token.getType()],
    beginOffset: token.getBeginOffset(),
    endOffset: token.getEndOffset(),
    beginLine: token.getBeginLine(),
    beginColumn: token.getBeginColumn(),
    endLine: token.getEndLine(),
    endColumn: token.getEndColumn(),
  };
}

test("TypeScript token streams and CST match the Java parser oracle", async () => {
  const corpus = await readJson(resolve(parityDirectory, "corpus.json"));
  const oracle = await readJson(resolve(parityDirectory, "java-oracle.json"));

  for (const entry of corpus) {
    const source = await sourceFor(entry);
    assert.deepEqual(tokenize(source), oracle.cases[entry.id].tokens, `${entry.id}: tokens`);

    let actualParse;
    try {
      actualParse = { status: "ok", cst: normalizeCst(parseCst(source)) };
    } catch (error) {
      assert.ok(error instanceof IodxParseError, `${entry.id}: unexpected ${error}`);
      actualParse = { status: "error", token: normalizeErrorToken(error.token) };
    }
    assert.deepEqual(actualParse, oracle.cases[entry.id].parse, `${entry.id}: parse`);
  }
});
