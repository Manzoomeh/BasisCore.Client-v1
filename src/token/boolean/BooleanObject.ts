import Util from "../../Util";
import ObjectToken from "../base/ObjectToken";

export default class BooleanObject extends ObjectToken<boolean> {
  constructor(rawValue: string) {
    super(rawValue);
  }
  TryParse(value: string): boolean {
    return Util.HasValue(value) ? value.toLowerCase() == "true" : false;
  }
}
