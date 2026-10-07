import assert from "node:assert/strict";
import test from "node:test";

import {
  IodxComment,
  IodxEntity,
  IodxField,
  IodxFloat32,
  IodxFloat64,
  IodxPrinter,
  parse,
  parseAll,
  parseCst,
  stringify,
  stringifyAll,
} from "../dist/index.js";

for (const value of ["hello", "+", "==", ",", ";"]) {
  test(`safe token '${value}' does not need quotes`, () => {
    assert.equal(new IodxPrinter().withoutQuotes(value), true);
  });
}

for (const value of [
  "",
  "hello world",
  "true",
  "false",
  "null",
  "42",
  "3.14",
  "=",
  "//x",
  "/*x*/",
]) {
  test(`structural or ambiguous string '${value}' needs quotes`, () => {
    assert.equal(new IodxPrinter().withoutQuotes(value), false);
  });
}

for (const [value, expected] of [
  [null, "null"],
  [true, "true"],
  [false, "false"],
  [42, "42"],
  [42n, "42l"],
  [new IodxFloat32(3.14), "3.14f"],
  [new IodxFloat32(3), "3f"],
  [new IodxFloat64(2.71), "2.71d"],
  [new IodxFloat64(2), "2d"],
  [new IodxFloat32(-0), "-0f"],
  [new IodxFloat64(-0), "-0d"],
  ["hello", "hello"],
  ["hello world", "'hello world'"],
  ["can't", '"can\'t"'],
  ["null", "'null'"],
]) {
  test(`stringify renders ${expected}`, () => {
    assert.equal(stringify(value), expected);
  });
}

test("stringify renders entities, fields, comments, sequences and maps", () => {
  assert.equal(stringify(new IodxEntity(null, [1, 2, 3])), "(1 2 3)");
  assert.equal(stringify(new IodxEntity("Vec2", ["x", "y"])), "Vec2(x y)");
  assert.equal(stringify(new IodxField("count", 42)), "count = 42");
  assert.equal(stringify([]), "()");
  assert.equal(stringify(new Map()), "(=)");
  assert.equal(
    stringify(
      new Map([
        ["key", "value"],
        ["count", 42],
      ]),
    ),
    "(key = value count = 42)",
  );
  assert.equal(stringify({ key: "value", count: 42 }), "(key = value count = 42)");
  assert.equal(stringify(new IodxComment(" generated", true)), "// generated");
  assert.equal(stringify(new IodxComment(" generated ", false)), "/* generated */");
});

test("single-line comments force multiline layout", () => {
  const value = new IodxEntity(null, [42, new IodxComment(" comment"), "hello"]);
  assert.equal(stringify(value), "(\n  42\n  // comment\n  hello\n)");
});

test("stringifyAll omits an outer wrapper", () => {
  assert.equal(stringifyAll([new IodxEntity("hello", ["world"]), null]), "hello(world) null");
});

test("direct renderer supports width and compaction settings", () => {
  const value = parse("outer(inner(1))");
  assert.equal(new IodxPrinter({ maxWidth: 1 }).render(value), "outer(\n  inner(\n    1\n  )\n)");
  assert.equal(
    new IodxPrinter({ maxWidth: 1 }).renderAll([value, null]),
    "outer(\n  inner(\n    1\n  )\n)\nnull",
  );
  assert.equal(stringify(value, { compactFromLevel: 1 }), "outer(inner(1))");
  assert.equal(stringify(value, { compactFromLevel: 2 }), "outer(\n  inner(1)\n)");
  assert.equal(
    stringify(new IodxEntity(null, [1, 2]), { tab: "\t", maxWidth: 1 }),
    "(\n\t1\n\t2\n)",
  );
});

test("CST printing normalizes literals without resolving entities", () => {
  assert.equal(stringify(parseCst("// comment")), "// comment");
  assert.equal(stringify(parseCst("/* comment */")), "/* comment */");
  assert.equal(stringify(parseCst('Spell("hello world" 2d)')), 'Spell("hello world" 2.0d)');
});

for (const source of [
  "()",
  "foo(bar)",
  "(a = b e c = d)",
  "/*comment*/",
  "'hello world'",
  "(=)",
  "Person(name = 'John' age = 25)",
]) {
  test(`syntax model round-trips '${source}'`, () => {
    assert.deepEqual(syntaxShape(parse(stringify(parse(source)))), syntaxShape(parse(source)));
  });
}

test("numeric types round-trip through the entity printer", () => {
  const values = parseAll("1 2L 3.5 4f 5d");
  const result = parseAll(stringifyAll(values));
  assert.deepEqual(
    result.map((value) => (typeof value === "bigint" ? "bigint" : value.constructor)),
    [Number, "bigint", IodxFloat32, IodxFloat32, IodxFloat64],
  );
});

test("unsupported values and non-finite numbers are rejected", () => {
  assert.throws(() => new IodxPrinter().render(new Date()), /Unsupported IODX value type: Date/);
  assert.throws(() => stringify(Number.POSITIVE_INFINITY), /non-finite/);
  assert.throws(() => stringify(new IodxFloat32(Number.NaN)), /non-finite/);
  assert.throws(() => stringify(0x8000000000000000n), /int64 value is out of range/);
});

function syntaxShape(value) {
  if (value instanceof IodxEntity) {
    return { entity: value.name, children: value.children.map(syntaxShape) };
  }
  if (value instanceof IodxField)
    return { field: [syntaxShape(value.key), syntaxShape(value.value)] };
  if (value instanceof IodxComment) return { comment: value.text, singleLine: value.singleLine };
  if (value instanceof Map)
    return { map: [...value].map(([key, item]) => [syntaxShape(key), syntaxShape(item)]) };
  if (typeof value === "bigint") return { int64: value.toString() };
  if (value instanceof IodxFloat32) return { float32: value.value };
  if (value instanceof IodxFloat64) return { float64: value.value };
  return value;
}
