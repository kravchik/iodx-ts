export class IodxFloat32 {
  public readonly value: number;

  public constructor(value: number) {
    this.value = Math.fround(value);
  }

  public valueOf(): number {
    return this.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}

export class IodxFloat64 {
  public constructor(public readonly value: number) {}

  public valueOf(): number {
    return this.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
