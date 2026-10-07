import type { Caret } from "../cst/caret.js";
import type { IodxFloat32, IodxFloat64 } from "../cst/numbers.js";

export type IodxScalar = string | number | bigint | boolean | null | IodxFloat32 | IodxFloat64;

export interface IodxWritableObject {
  readonly [key: string]: IodxWritable;
}

export type IodxWritable =
  | IodxScalar
  | IodxEntity
  | IodxField
  | IodxComment
  | readonly IodxWritable[]
  | ReadonlyMap<IodxWritable, IodxWritable>
  | IodxWritableObject;

export type IodxValue =
  IodxScalar | IodxEntity | IodxField | IodxComment | ReadonlyMap<IodxWritable, IodxWritable>;

export class IodxField {
  public readonly kind = "field" as const;

  public constructor(
    public readonly key: IodxWritable,
    public readonly value: IodxWritable,
    public readonly caret: Caret | null = null,
  ) {}
}

export class IodxComment {
  public readonly kind = "comment" as const;

  public constructor(
    public readonly text: string,
    public readonly singleLine = true,
    public readonly caret: Caret | null = null,
  ) {}
}

export class IodxEntity {
  public readonly kind = "entity" as const;

  public constructor(
    public readonly name: string | null,
    public readonly children: readonly IodxWritable[] = [],
    public readonly caret: Caret | null = null,
    public readonly childrenCarets: readonly (Caret | null)[] = [],
  ) {}

  public hasField(key: IodxWritable): boolean {
    return this.fields.some((field) => Object.is(field.key, key));
  }

  public getField(key: IodxWritable, defaultValue?: IodxWritable): IodxWritable | undefined {
    const field = this.fields.find((candidate) => Object.is(candidate.key, key));
    return field === undefined ? defaultValue : field.value;
  }

  public get fields(): IodxField[] {
    return this.children.filter((child): child is IodxField => child instanceof IodxField);
  }

  public withReplaced(key: IodxWritable, value: IodxWritable): IodxEntity {
    if (key === null) throw new TypeError("key is null");
    return new IodxEntity(
      this.name,
      this.children.map((child) =>
        child instanceof IodxField && Object.is(child.key, key)
          ? new IodxField(key, value, child.caret)
          : child,
      ),
      this.caret,
      [...this.childrenCarets],
    );
  }
}

export function entity(name: string | null, children: readonly IodxWritable[] = []): IodxEntity {
  return new IodxEntity(name, children);
}

export function field(key: IodxWritable, value: IodxWritable): IodxField {
  return new IodxField(key, value);
}

export function comment(text: string, singleLine = true): IodxComment {
  return new IodxComment(text, singleLine);
}

export function isIodxEntity(value: unknown): value is IodxEntity {
  return value instanceof IodxEntity;
}

export function isIodxField(value: unknown): value is IodxField {
  return value instanceof IodxField;
}

export function isIodxComment(value: unknown): value is IodxComment {
  return value instanceof IodxComment;
}
