import { isHighSurrogate, isLowSurrogate } from "../runtime/source-text.js";

export class IodxEscapeError extends Error {
  public readonly length: number;

  public constructor(
    message: string,
    public readonly offset: number,
    length: number,
  ) {
    super(message);
    this.name = "IodxEscapeError";
    this.length = Math.max(1, length);
  }
}

const unescapes: Readonly<Record<string, string>> = {
  t: "\t",
  b: "\b",
  r: "\r",
  f: "\f",
  "\\": "\\",
  n: "\n",
  s: " ",
  '"': '"',
  "'": "'",
};

const commonEscapes: Readonly<Record<string, string>> = {
  "\t": "t",
  "\b": "b",
  "\r": "r",
  "\f": "f",
  "\\": "\\",
};

export function unescapeQuoted(value: string): string {
  if (value.length < 2 || (value[0] !== '"' && value[0] !== "'") || value.at(-1) !== value[0]) {
    throw new IodxEscapeError("Expected a quoted string", 0, value.length);
  }
  return unescape(value.slice(1, -1));
}

export const unescapeDoubleQuotes = unescapeQuoted;
export const unescapeSingleQuotes = unescapeQuoted;

export function unescape(value: string): string {
  let result = "";
  for (let offset = 0; offset < value.length; offset += 1) {
    const codeUnit = value.charCodeAt(offset);
    if (codeUnit === 0x0d) continue;

    if (codeUnit === 0x5c) {
      const escapeOffset = offset;
      offset += 1;
      if (offset >= value.length) {
        throw new IodxEscapeError("Uncompleted escape sequence", escapeOffset, 1);
      }
      const symbol = value[offset];
      if (symbol === "u") {
        const unicode = parseUnicodeEscape(value, escapeOffset);
        offset = escapeOffset + 5;
        if (isHighSurrogate(unicode)) {
          const lowOffset = offset + 1;
          if (!value.startsWith("\\u", lowOffset)) {
            throw new IodxEscapeError(
              "High surrogate must be followed by a low surrogate escape",
              escapeOffset,
              6,
            );
          }
          const low = parseUnicodeEscape(value, lowOffset);
          if (!isLowSurrogate(low)) {
            throw new IodxEscapeError("Expected a low surrogate escape", lowOffset, 6);
          }
          result += String.fromCharCode(unicode, low);
          offset = lowOffset + 5;
          continue;
        }
        if (isLowSurrogate(unicode)) {
          throw new IodxEscapeError("Unexpected low surrogate", escapeOffset, 6);
        }
        result += String.fromCharCode(unicode);
        continue;
      }

      const decoded = symbol === undefined ? undefined : unescapes[symbol];
      if (decoded === undefined) {
        throw new IodxEscapeError(`Unknown escape symbol: ${symbol ?? ""}`, escapeOffset, 2);
      }
      result += decoded;
      continue;
    }

    if (isHighSurrogate(codeUnit)) {
      const low = value.charCodeAt(offset + 1);
      if (!isLowSurrogate(low)) throw new IodxEscapeError("Lone high surrogate", offset, 1);
      result += value.slice(offset, offset + 2);
      offset += 1;
      continue;
    }
    if (isLowSurrogate(codeUnit)) throw new IodxEscapeError("Lone low surrogate", offset, 1);
    result += value[offset];
  }
  return result;
}

export function escapeDoubleQuotes(value: string): string {
  return escape(value, { ...commonEscapes, '"': '"' });
}

export function escapeSingleQuotes(value: string): string {
  return escape(value, { ...commonEscapes, "'": "'" });
}

function escape(value: string, escapes: Readonly<Record<string, string>>): string {
  let result = "";
  for (let offset = 0; offset < value.length; offset += 1) {
    const character = value[offset] ?? "";
    const codeUnit = value.charCodeAt(offset);
    if (isHighSurrogate(codeUnit)) {
      const low = value.charCodeAt(offset + 1);
      if (!isLowSurrogate(low)) throw new TypeError(`Lone high surrogate at offset ${offset}`);
      result += value.slice(offset, offset + 2);
      offset += 1;
      continue;
    }
    if (isLowSurrogate(codeUnit)) throw new TypeError(`Lone low surrogate at offset ${offset}`);

    const escaped = escapes[character];
    if (escaped !== undefined) result += `\\${escaped}`;
    else if (character !== "\n" && isIsoControl(codeUnit)) {
      result += `\\u${codeUnit.toString(16).toUpperCase().padStart(4, "0")}`;
    } else result += character;
  }
  return result;
}

function parseUnicodeEscape(value: string, offset: number): number {
  const available = value.length - offset;
  if (available < 6) throw new IodxEscapeError("Incomplete Unicode escape", offset, available);
  const digits = value.slice(offset + 2, offset + 6);
  if (!/^[0-9a-fA-F]{4}$/u.test(digits)) {
    throw new IodxEscapeError("Invalid hexadecimal digit in Unicode escape", offset, 6);
  }
  return Number.parseInt(digits, 16);
}

function isIsoControl(codeUnit: number): boolean {
  return codeUnit <= 0x1f || (codeUnit >= 0x7f && codeUnit <= 0x9f);
}
