import { Caret } from "../cst/caret.js";
import { IodxCst } from "../cst/cst.js";
import { parseCst } from "../parser.js";
import { IodxEntity, IodxComment, IodxField, type IodxValue, type IodxWritable } from "./entity.js";
import { IodxEntityError } from "./error.js";

export function parse(source: string): IodxValue {
  const values = parseAll(source);
  if (values.length !== 1) {
    throw new IodxEntityError(`Expected exactly one value, got ${values.length}`);
  }
  return values[0] as IodxValue;
}

export function parseAll(source: string): IodxValue[] {
  return resolveNodes(parseCst(source).children).values;
}

function valueFromCst(node: IodxCst): IodxValue | IodxValue[] {
  if (node.type === "LIST_BODY") return resolveNodes(node.children).values;
  if (node.type === "NAMED_CLASS" || node.type === "UNNAMED_CLASS") {
    const body = requiredField(node, "body");
    if (node.type === "UNNAMED_CLASS" && isEmptyMap(body.children)) {
      return new Map<IodxWritable, IodxWritable>();
    }
    const name = node.type === "NAMED_CLASS" ? entityName(requiredField(node, "name").value) : null;
    const resolved = resolveNodes(body.children);
    return new IodxEntity(name, resolved.values, node.caret, resolved.carets);
  }
  if (node.type === "COMMENT_SINGLE_LINE") {
    return new IodxComment(String(node.value), true, node.caret);
  }
  if (node.type === "COMMENT_MULTI_LINE") {
    return new IodxComment(String(node.value), false, node.caret);
  }
  if (
    node.type === "INTEGER_LITERAL" ||
    node.type === "FLOATING_POINT_LITERAL" ||
    node.type === "STRING_LITERAL_DQ" ||
    node.type === "STRING_LITERAL_SQ" ||
    node.type === "ANY_LITERAL" ||
    node.type === "ANY_OPERATOR" ||
    node.type === "ANY_SEPARATOR"
  ) {
    return node.value;
  }
  throw new IodxEntityError(`Unknown IODX CST node type: ${node.type}`, node.caret);
}

interface ResolvedNodes {
  readonly values: IodxValue[];
  readonly carets: (Caret | null)[];
}

function resolveNodes(nodes: readonly IodxCst[]): ResolvedNodes {
  const values: IodxValue[] = [];
  const carets: (Caret | null)[] = [];
  let leftNode: IodxCst | null = null;

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index] as IodxCst;
    if (!isDelimiter(node)) {
      leftNode = node;
      values.push(resolveSingle(node));
      carets.push(node.caret);
      continue;
    }

    if (leftNode === null) throw entityError("Expected key before '='", node);
    if (isComment(leftNode)) throw entityError("Comment instead of key", leftNode);

    index += 1;
    const rightNode = nodes[index];
    if (rightNode === undefined) throw entityError("Expected value after '='", node);
    if (isComment(rightNode)) throw entityError("Comment instead of value", rightNode);
    if (isDelimiter(rightNode)) throw entityError("Expected value", rightNode);

    const fieldCaret = combineCarets(leftNode.caret, rightNode.caret);
    values[values.length - 1] = new IodxField(
      values[values.length - 1] as IodxValue,
      resolveSingle(rightNode),
      fieldCaret,
    );
    carets[carets.length - 1] = fieldCaret;
    leftNode = null;
  }
  return { values, carets };
}

function resolveSingle(node: IodxCst): IodxValue {
  const value = valueFromCst(node);
  if (Array.isArray(value)) {
    throw new IodxEntityError("A list body cannot be used as a single value", node.caret);
  }
  return value as IodxValue;
}

function requiredField(node: IodxCst, name: string): IodxCst {
  const value = node.childByField.get(name);
  if (value === undefined) {
    throw new IodxEntityError(`Missing CST field '${name}' on ${node.type}`, node.caret);
  }
  return value;
}

function entityError(message: string, node: IodxCst): IodxEntityError {
  const location = node.caret === null ? "" : ` at ${node.caret.formatBegin()}`;
  return new IodxEntityError(message + location, node.caret);
}

function combineCarets(left: Caret | null, right: Caret | null): Caret | null {
  if (left === null) return null;
  return right === null ? left : Caret.startEnd(left, right);
}

function isDelimiter(node: IodxCst): boolean {
  return node.type === "ANY_OPERATOR" && node.value === "=";
}

function isComment(node: IodxCst): boolean {
  return node.type === "COMMENT_SINGLE_LINE" || node.type === "COMMENT_MULTI_LINE";
}

function isEmptyMap(nodes: readonly IodxCst[]): boolean {
  return nodes.length === 1 && isDelimiter(nodes[0] as IodxCst);
}

function entityName(value: unknown): string {
  if (value === true) return "true";
  if (value === false) return "false";
  if (value === null) return "null";
  return String(value);
}
