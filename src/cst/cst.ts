import type { Caret } from "./caret.js";
import type { IodxFloat32, IodxFloat64 } from "./numbers.js";

export type IodxCstValue = string | number | bigint | boolean | null | IodxFloat32 | IodxFloat64;

export class IodxCst {
  public constructor(
    public readonly type: string,
    public readonly caret: Caret | null,
    public value: IodxCstValue = null,
    public readonly children: IodxCst[] = [],
    public readonly childByField: Map<string, IodxCst> = new Map(),
  ) {}

  public toString(): string {
    if (this.children.length === 0) return this.type;
    return `${this.type}([${this.children.map(String).join(", ")}])`;
  }
}
