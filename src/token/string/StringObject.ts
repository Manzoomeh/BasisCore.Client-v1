import ObjectToken from "../base/ObjectToken";

export default class StringObject extends ObjectToken<string> {
  constructor(rawValue: string) {
    super(rawValue);
  }
  TryParse(value: string): string {
    return value;
  }
}
