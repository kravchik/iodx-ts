import assert from "node:assert/strict";
import test from "node:test";

import {
  BitSet,
  CancellationError,
  JavaList,
  JavaMap,
  SourceText,
  Token,
  TokenSet,
  TokenSource,
  TokenType,
  binarySearch,
  codePointAt,
} from "../dist/runtime/index.js";

test("BitSet supports the operations emitted by CongoCC", () => {
  const bits = new BitSet(4);
  bits.set(1);
  bits.set(35);

  assert.equal(bits.get(1), true);
  assert.equal(bits.nextSetBit(2), 35);
  assert.equal(bits.previousSetBit(34), 1);
  assert.equal(bits.length(), 36);

  bits.clear(0, 2);
  assert.equal(bits.get(1), false);
  bits.clear(35);
  assert.equal(bits.isEmpty(), true);
});

test("TokenSet and collection adapters preserve Java mutation semantics", () => {
  const tokens = TokenSet.of(TokenType.EOF);
  assert.equal(tokens.add(TokenType.EOF), false);
  assert.equal(tokens.add(TokenType.ANY_LITERAL), true);
  assert.equal(tokens.contains(TokenType.ANY_LITERAL), true);
  assert.equal(tokens.remove(TokenType.EOF), true);

  const list = new JavaList();
  assert.equal(list.add("first"), true);
  list.add("second");
  assert.equal(list.remove(0), "first");
  assert.deepEqual(list.toArray(), ["second"]);

  const map = new JavaMap();
  assert.equal(map.put("key", 1), undefined);
  assert.equal(map.put("key", 2), 1);
  assert.equal(map.get("key"), 2);
  assert.throws(() => {
    throw new CancellationError();
  }, /Parsing cancelled/);
});

test("Java helpers use Java-compatible code points and binary-search results", () => {
  assert.equal(binarySearch([10, 20, 30], 20), 1);
  assert.equal(binarySearch([10, 20, 30], 15), -2);
  assert.equal(codePointAt("a😀", 1), 0x1f600);
  assert.equal(codePointAt("a😀", 2), 0xde00);
  assert.equal(TokenSource.checkIntervals([10, 20], 15), true);
  assert.equal(TokenSource.checkIntervals([10, 20], 21), false);
});

test("SourceText reports UTF-16 offsets and code-point columns", () => {
  const text = new SourceText("unicode.iodx", "a😀\tb\r\nЖ", { tabSize: 4 });

  assert.equal(text.length(), 8);
  assert.equal(text.getText(0, 8), "a😀\tb\r\nЖ");
  assert.equal(text.getLineFromOffset(6), 1);
  assert.equal(text.getLineFromOffset(7), 2);
  assert.equal(text.getLineFromOffset(8), 2);
  assert.equal(text.getCodePointColumnFromOffset(1), 2);
  assert.equal(text.getCodePointColumnFromOffset(2), 2);
  assert.equal(text.getCodePointColumnFromOffset(3), 3);
  assert.equal(text.getCodePointColumnFromOffset(4), 5);
  assert.equal(text.getCodePointColumnFromOffset(7), 1);
  assert.equal(text.getCodePointColumnFromOffset(8), 1);
});

test("SourceText honors non-default starting positions and trailing EOF lines", () => {
  const source = new TokenSource("fragment.iodx", "x\n", {
    startingLine: 10,
    startingColumn: 5,
  });

  assert.equal(source.getLineFromOffset(0), 10);
  assert.equal(source.getCodePointColumnFromOffset(0), 5);
  assert.equal(source.getLineFromOffset(2), 11);
  assert.equal(source.getCodePointColumnFromOffset(2), 1);

  const eof = new Token(TokenType.EOF, source, 2, 2);
  assert.equal(eof.toString(), "");
  assert.equal(eof.getBeginLine(), 11);
  assert.equal(eof.getBeginColumn(), 1);
  assert.equal(eof.isVirtual(), true);
});

test("TokenSource caches tokens and preserves source ranges", () => {
  const source = new TokenSource("tokens.iodx", "foo bar");
  const foo = new Token(TokenType.ANY_LITERAL, source, 0, 3);
  const space = new Token(TokenType.WHITE_SPACE, source, 3, 4);
  const bar = new Token(TokenType.ANY_LITERAL, source, 4, 7);
  space.setUnparsed(true);
  source.cacheToken(foo);
  source.cacheToken(space);
  source.cacheToken(bar);

  assert.equal(foo.toString(), "foo");
  assert.equal(foo.getBeginLine(), 1);
  assert.equal(foo.getBeginColumn(), 1);
  assert.equal(foo.getEndColumn(), 3);
  assert.equal(foo.nextCachedToken(), space);
  assert.equal(foo.getNext(), bar);
  assert.equal(bar.getPrevious(), foo);
  assert.equal(bar.getLocation(), "tokens.iodx:1:5");

  source.uncacheTokens(foo);
  assert.equal(foo.nextCachedToken(), null);
});
