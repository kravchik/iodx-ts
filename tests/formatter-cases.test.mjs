import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import { IodxField, parse, parseAll, stringify } from "../dist/index.js";

const casesUrl = new URL("./resources/upstream/formatting.cases.sql.style.iodx", import.meta.url);

test("upstream formatter cases and whitespace variants match Java/Python", async () => {
  const settings = {
    maxWidth: 100,
    maxLocalWidth: Number.MAX_SAFE_INTEGER,
    compactFromLevel: 0,
  };

  for (const item of parseAll(await readFile(casesUrl, "utf8"))) {
    if (item instanceof IodxField) {
      settings[item.key] = item.value;
      continue;
    }
    if (typeof item !== "string") continue;

    assert.equal(format(item, settings), item);
    assert.equal(format(replaceWhitespace(item, " "), settings), item);
    assert.equal(format(replaceWhitespace(item, "\n    "), settings), item);
  }
});

function format(source, settings) {
  return `\n${stringify(parse(source), settings)}\n`;
}

function replaceWhitespace(text, replacement) {
  let result = "";
  let state = "normal";

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (state === "single" || state === "double") {
      result += character;
      if (character === "\\" && index + 1 < text.length) {
        index += 1;
        result += text[index];
      } else if (state === "single" && character === "'") state = "normal";
      else if (state === "double" && character === '"') state = "normal";
      continue;
    }

    if (state === "line-comment") {
      result += character;
      if (character === "\r" || character === "\n") state = "normal";
      continue;
    }

    if (state === "block-comment") {
      result += character;
      if (character === "*" && text[index + 1] === "/") {
        index += 1;
        result += "/";
        state = "normal";
      }
      continue;
    }

    if (character === "'" || character === '"') {
      state = character === "'" ? "single" : "double";
      result += character;
    } else if (text.startsWith("//", index)) {
      state = "line-comment";
      result += "//";
      index += 1;
    } else if (text.startsWith("/*", index)) {
      state = "block-comment";
      result += "/*";
      index += 1;
    } else if (/\s/u.test(character)) {
      while (/\s/u.test(text[index + 1] ?? "")) index += 1;
      result += replacement;
    } else result += character;
  }

  return result;
}
