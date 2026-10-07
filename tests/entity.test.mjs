import assert from "node:assert/strict";
import test from "node:test";

import {
  Caret,
  comment,
  entity,
  field,
  IodxComment,
  IodxEntity,
  IodxEntityError,
  IodxField,
  IodxFloat32,
  IodxFloat64,
  isIodxComment,
  isIodxEntity,
  isIodxField,
  parse,
  parseAll,
} from "../dist/index.js";

test("parse creates named, unnamed and nested entities", () => {
  assert.deepEqual(parseAll(""), []);
  assert.deepEqual(entityShape(parse("()")), { name: null, children: [] });
  assert.deepEqual(entityShape(parse("foo()")), { name: "foo", children: [] });
  assert.deepEqual(entityShape(parse("foo(bar)")), { name: "foo", children: ["bar"] });
  assert.deepEqual(entityShape(parse("foo(bar(hello))")), {
    name: "foo",
    children: [{ name: "bar", children: ["hello"] }],
  });
  assert.deepEqual(entityShape(parse("foo(bar (hello))")), {
    name: "foo",
    children: ["bar", { name: null, children: ["hello"] }],
  });
});

test("parse combines field triples and preserves mixed positional children", () => {
  assert.deepEqual(entityShape(parse("(a=b e c=d f)")), {
    name: null,
    children: [{ field: ["a", "b"] }, "e", { field: ["c", "d"] }, "f"],
  });
  assert.deepEqual(entityShape(parse("(null=value key=null true=false)")), {
    name: null,
    children: [{ field: [null, "value"] }, { field: ["key", null] }, { field: [true, false] }],
  });
  assert.deepEqual(entityShape(parse("(a,b;c)")), {
    name: null,
    children: ["a", ",", "b", ";", "c"],
  });
});

test("the explicit empty-map syntax produces a native Map", () => {
  const value = parse("(=)");
  assert.ok(value instanceof Map);
  assert.equal(value.size, 0);
});

test("parse uses native bigint for int64 and preserves floating-point suffix types", () => {
  const values = parseAll("42 42L 1.5 2f 3d");
  assert.equal(values[0], 42);
  assert.equal(values[1], 42n);
  assert.ok(values[2] instanceof IodxFloat32);
  assert.ok(values[3] instanceof IodxFloat32);
  assert.ok(values[4] instanceof IodxFloat64);
});

test("entities, fields and comments preserve source ranges", () => {
  const person = parse('Person(name = "John"\nage = 25)');
  assert.ok(person instanceof IodxEntity);
  assert.deepEqual(person.caret, new Caret(1, 1, 2, 9, 0, 30));
  assert.deepEqual(person.childrenCarets, [
    new Caret(1, 8, 1, 20, 7, 20),
    new Caret(2, 1, 2, 8, 21, 29),
  ]);
  assert.equal(person.children[0].caret, person.childrenCarets[0]);

  const values = parseAll("//header\nPerson('John') 42 /*tail*/");
  assert.ok(values[0] instanceof IodxComment);
  assert.deepEqual(values[0].caret, new Caret(1, 1, 1, 8, 0, 8));
  assert.deepEqual(entityShape(values[1]), { name: "Person", children: ["John"] });
  assert.equal(values[2], 42);
  assert.deepEqual(commentShape(values[3]), { text: "tail", singleLine: false });
});

for (const [source, message, offset] of [
  ["(= a)", "Expected key before '=' at 1:2", 1],
  ["(a =)", "Expected value after '=' at 1:4", 3],
  ["(a = =)", "Expected value at 1:6", 5],
  ["(a = b = c)", "Expected key before '=' at 1:8", 7],
  ["(a//\n = b)", "Comment instead of key at 1:3", 2],
  ["(a = //\nb)", "Comment instead of value at 1:6", 5],
]) {
  test(`invalid field '${source.replaceAll("\n", "\\n")}' reports its semantic location`, () => {
    assert.throws(
      () => parse(source),
      (error) => {
        assert.ok(error instanceof IodxEntityError);
        assert.equal(error.message, message);
        assert.equal(error.range?.beginOffset, offset);
        return true;
      },
    );
  });
}

for (const [source, count] of [
  ["", 0],
  ["a b", 2],
]) {
  test(`parse requires one value instead of ${count}`, () => {
    assert.throws(() => parse(source), new RegExp(`Expected exactly one value, got ${count}`));
  });
}

test("entity field helpers query and copy fields", () => {
  const entity = new IodxEntity("Config", [new IodxField("width", 800), "visible"]);
  assert.equal(entity.hasField("width"), true);
  assert.equal(entity.hasField("height"), false);
  assert.equal(entity.getField("width"), 800);
  assert.equal(entity.getField("height", 600), 600);
  assert.deepEqual(entity.fields, [new IodxField("width", 800)]);
  assert.equal(entity.withReplaced("width", 1024).getField("width"), 1024);
  assert.equal(entity.getField("width"), 800);

  const nullable = new IodxEntity("Config", [new IodxField("optional", null)]);
  assert.equal(nullable.getField("optional", "fallback"), null);
});

test("factories, discriminants and type guards expose the syntax model idiomatically", () => {
  const name = field("name", "Whisper");
  const note = comment(" generated");
  const spell = entity("Spell", [name, note]);

  assert.equal(spell.kind, "entity");
  assert.equal(name.kind, "field");
  assert.equal(note.kind, "comment");
  assert.equal(isIodxEntity(spell), true);
  assert.equal(isIodxField(name), true);
  assert.equal(isIodxComment(note), true);
  assert.equal(isIodxEntity(name), false);
});

function entityShape(value) {
  if (value instanceof IodxEntity) {
    return { name: value.name, children: value.children.map(entityShape) };
  }
  if (value instanceof IodxField)
    return { field: [entityShape(value.key), entityShape(value.value)] };
  if (value instanceof IodxComment) return commentShape(value);
  return value;
}

function commentShape(value) {
  assert.ok(value instanceof IodxComment);
  return { text: value.text, singleLine: value.singleLine };
}
