export interface Option<T> {
  unwrap(): T;
}

export class Some<T> implements Option<T> {
  constructor(private value: T) {}

  unwrap(): T {
    return this.value;
  }
}
export class None<T> implements Option<T> {
  private ignored: T | undefined;
  constructor() {}
  unwrap(): T {
    return this.ignored!;
  }
}
