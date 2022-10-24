export class ResultPanic extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'ResultPanic';
    return Object.setPrototypeOf(this, new.target.prototype);
  }
}
