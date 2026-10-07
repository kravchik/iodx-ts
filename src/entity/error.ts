import type { Caret } from "../cst/caret.js";

export class IodxEntityError extends Error {
  public constructor(
    message: string,
    public readonly range: Caret | null = null,
  ) {
    super(message);
    this.name = "IodxEntityError";
  }
}
