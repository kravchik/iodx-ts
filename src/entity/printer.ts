import { IodxCst } from "../cst/cst.js";
import { escapeDoubleQuotes, escapeSingleQuotes } from "../cst/escaping.js";
import { IodxFloat32, IodxFloat64 } from "../cst/numbers.js";
import { parseCst } from "../parser.js";
import {
  IodxComment,
  IodxEntity,
  IodxField,
  type IodxScalar,
  type IodxWritable,
} from "./entity.js";

const int64Min = -0x8000000000000000n;
const int64Max = 0x7fffffffffffffffn;

export type IodxPrintable = IodxWritable | IodxCst;

export interface IodxPrinterOptions {
  readonly maxWidth?: number;
  readonly maxLocalWidth?: number;
  readonly compactFromLevel?: number;
  readonly tab?: string;
}

export class IodxPrinter {
  public readonly maxWidth: number;
  public readonly maxLocalWidth: number;
  public readonly compactFromLevel: number;
  public readonly tab: string;
  private level = 0;

  public constructor(options: IodxPrinterOptions = {}) {
    this.maxWidth = options.maxWidth ?? 100;
    this.maxLocalWidth = options.maxLocalWidth ?? Number.MAX_SAFE_INTEGER;
    this.compactFromLevel = options.compactFromLevel ?? 0;
    this.tab = options.tab ?? "  ";
  }

  public render(value: IodxPrintable): string {
    return this.printValue(0, value).join("\n");
  }

  public renderAll(values: readonly IodxPrintable[]): string {
    return this.printList(values, 0, null, null, false).join("\n");
  }

  public withoutQuotes(value: string): boolean {
    if (
      value.length === 0 ||
      value === "true" ||
      value === "false" ||
      value === "null" ||
      value === "="
    ) {
      return false;
    }
    try {
      const document = parseCst(value);
      if (document.children.length !== 1) return false;
      const type = document.children[0]?.type;
      return type === "ANY_LITERAL" || type === "ANY_OPERATOR" || type === "ANY_SEPARATOR";
    } catch {
      return false;
    }
  }

  public valueToString(value: IodxScalar): string {
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "string") {
      if (this.withoutQuotes(value)) return value;
      return value.includes("'")
        ? `"${escapeDoubleQuotes(value)}"`
        : `'${escapeSingleQuotes(value)}'`;
    }
    if (typeof value === "bigint") {
      if (value < int64Min || value > int64Max) {
        throw new RangeError(`IODX int64 value is out of range: ${value}`);
      }
      return `${value}l`;
    }
    if (value instanceof IodxFloat32) return `${float32Text(value.value, true)}f`;
    if (value instanceof IodxFloat64) return `${float64Text(value.value, true)}d`;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new RangeError("IODX does not support non-finite numbers");
      return Number.isInteger(value) ? String(value) : `${float64Text(value, true)}d`;
    }
    throw new TypeError(`Unsupported IODX value type: ${valueType(value)}`);
  }

  private printValue(startAt: number, value: IodxPrintable): string[] {
    if (value instanceof IodxCst) return this.printCst(startAt, value);
    if (value instanceof IodxField) {
      const result = this.printValue(startAt, value.key);
      const valueResult = this.printValue(startAt + this.tab.length, value.value);
      const last = result.length - 1;
      if (last < 0 || valueResult.length === 0) throw new Error("An IODX field produced no output");
      result[last] = `${result[last]} = ${valueResult[0]}`;
      result.push(...valueResult.slice(1));
      return result;
    }
    if (value instanceof IodxComment) {
      return [value.singleLine ? `//${value.text}` : `/*${value.text}*/`];
    }
    if (value instanceof IodxEntity) {
      return this.printList(
        value.children,
        startAt,
        value.name === null ? "(" : `${value.name}(`,
        ")",
        true,
      );
    }
    if (isIodxMap(value)) {
      if (value.size === 0) return ["(=)"];
      const fields = [...value].map(([key, item]) => new IodxField(key, item));
      return this.printList(fields, startAt, "(", ")", true);
    }
    if (isIodxArray(value)) return this.printList(value, startAt, "(", ")", true);
    if (isPlainObject(value)) {
      const entries = Object.entries(value).map(
        ([key, item]) => new IodxField(key, item as IodxWritable),
      );
      if (entries.length === 0) return ["(=)"];
      return this.printList(entries, startAt, "(", ")", true);
    }
    return [this.valueToString(value)];
  }

  private printCst(startAt: number, node: IodxCst): string[] {
    if (node.type === "LIST_BODY") return this.printList(node.children, startAt, null, null, false);
    if (node.type === "NAMED_CLASS" || node.type === "UNNAMED_CLASS") {
      const body = node.childByField.get("body");
      if (body === undefined) throw new TypeError(`Missing CST field 'body' on ${node.type}`);
      const nameNode = node.childByField.get("name");
      const name = node.type === "NAMED_CLASS" ? literalText(nameNode?.value) : "";
      return this.printList(body.children, startAt, `${name}(`, ")", true);
    }
    if (node.type === "COMMENT_SINGLE_LINE") return [`//${String(node.value)}`];
    if (node.type === "COMMENT_MULTI_LINE") return [`/*${String(node.value)}*/`];
    if (node.type === "INTEGER_LITERAL") {
      return [String(node.value)];
    }
    if (node.type === "FLOATING_POINT_LITERAL") {
      if (node.value instanceof IodxFloat32) return [float32Text(node.value.value)];
      if (node.value instanceof IodxFloat64) return [`${float64Text(node.value.value)}d`];
      return [String(node.value)];
    }
    if (node.type === "STRING_LITERAL_DQ") return [`"${escapeDoubleQuotes(String(node.value))}"`];
    if (node.type === "STRING_LITERAL_SQ") return [`'${escapeSingleQuotes(String(node.value))}'`];
    if (
      node.type === "ANY_LITERAL" ||
      node.type === "ANY_OPERATOR" ||
      node.type === "ANY_SEPARATOR"
    ) {
      return [literalText(node.value)];
    }
    if (node.type === "LEFT_PAREN") return ["("];
    if (node.type === "RIGHT_PAREN") return [")"];
    if (node.type === "WHITE_SPACE") return [" "];
    throw new TypeError(`Unsupported IODX CST node type: ${node.type}`);
  }

  private printList(
    values: readonly IodxPrintable[],
    startAt: number,
    left: string | null,
    right: string | null,
    addTabs: boolean,
  ): string[] {
    if ((left === null) !== (right === null)) {
      throw new TypeError("left and right must either both be set or both be null");
    }
    this.level += 1;
    try {
      return this.printListAtCurrentLevel(values, startAt, left, right, addTabs);
    } finally {
      this.level -= 1;
    }
  }

  private printListAtCurrentLevel(
    values: readonly IodxPrintable[],
    startAt: number,
    left: string | null,
    right: string | null,
    addTabs: boolean,
  ): string[] {
    const rendered: string[] = [];
    let commonLength = 0;
    let tryCompact = true;

    for (const value of values) {
      if (isSingleLineComment(value)) tryCompact = false;
      const childLines = this.printValue(startAt + this.tab.length, value);
      if (childLines.length === 0) throw new Error("An IODX value produced no output");
      rendered.push(...childLines);
      if (childLines.length > 1) tryCompact = false;
      else commonLength += childLines[0]?.length ?? 0;
    }

    if (tryCompact && this.level >= this.compactFromLevel) {
      let estimatedLength = commonLength + Math.max(0, rendered.length - 1);
      if (left !== null && right !== null) estimatedLength += left.length + right.length;
      if (estimatedLength + startAt <= this.maxWidth && estimatedLength <= this.maxLocalWidth) {
        const body = rendered.join(" ");
        return [left === null || right === null ? body : `${left}${body}${right}`];
      }
    }

    if (left === null || right === null) {
      return addTabs ? rendered.map((line) => `${this.tab}${line}`) : rendered;
    }
    return addTabs
      ? [left, ...rendered.map((line) => `${this.tab}${line}`), right]
      : [left, ...rendered, right];
  }
}

export function stringify(value: IodxPrintable, options: IodxPrinterOptions = {}): string {
  return new IodxPrinter(options).render(value);
}

export function stringifyAll(
  values: readonly IodxPrintable[],
  options: IodxPrinterOptions = {},
): string {
  return new IodxPrinter(options).renderAll(values);
}

function float32Text(value: number, compactInteger = false): string {
  if (!Number.isFinite(value)) throw new RangeError("IODX does not support non-finite numbers");
  if (Object.is(value, -0)) return compactInteger ? "-0" : "-0.0";
  let text = value.toString();
  for (let precision = 1; precision <= 9; precision += 1) {
    const candidate = Number(value.toPrecision(precision)).toString();
    if (Object.is(Math.fround(Number(candidate)), value)) {
      text = candidate;
      break;
    }
  }
  return formatIntegralFloat(text, value, compactInteger);
}

function float64Text(value: number, compactInteger = false): string {
  if (!Number.isFinite(value)) throw new RangeError("IODX does not support non-finite numbers");
  if (Object.is(value, -0)) return compactInteger ? "-0" : "-0.0";
  const text = value.toString();
  return formatIntegralFloat(text, value, compactInteger);
}

function formatIntegralFloat(text: string, value: number, compactInteger: boolean): string {
  if (!Number.isInteger(value) || /[eE]/u.test(text)) return text;
  if (compactInteger) return text.endsWith(".0") ? text.slice(0, -2) : text;
  return text.endsWith(".0") ? text : `${text}.0`;
}

function literalText(value: unknown): string {
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  return String(value);
}

function isSingleLineComment(value: unknown): boolean {
  if (value instanceof IodxComment) return value.singleLine;
  return value instanceof IodxCst && value.type === "COMMENT_SINGLE_LINE";
}

function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

function isIodxArray(value: IodxPrintable): value is readonly IodxWritable[] {
  return Array.isArray(value);
}

function isIodxMap(value: IodxPrintable): value is ReadonlyMap<IodxWritable, IodxWritable> {
  return value instanceof Map;
}

function valueType(value: unknown): string {
  if (value === null) return "null";
  if (typeof value !== "object") return typeof value;
  return value.constructor?.name ?? "object";
}
