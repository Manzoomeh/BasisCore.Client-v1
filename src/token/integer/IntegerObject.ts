import ObjectToken from "../base/ObjectToken";

export default class IntegerObject extends ObjectToken<number> {
  constructor(rawValue: string) {
    super(rawValue);
  }
  TryParse(value: string): number {
    try {
      return parseInt(value);
    } catch {
      /*Nothing*/
    }
    return 0;
  }
}
