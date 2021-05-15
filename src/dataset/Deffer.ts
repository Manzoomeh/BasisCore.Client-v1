export default class Deffer<T> {
  readonly Promise: Promise<T>;
  Resolve: () => void;
  Reject: () => void;
  constructor() {
    this.Promise = new Promise<T>(
      function (resolve, reject) {
        this.Resolve = resolve;
        this.Reject = reject;
      }.bind(this)
    );
  }
}
