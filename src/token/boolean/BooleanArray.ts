import IToken from "../../interface/IToken";
import Util from "../../Util";
import ArrayToken from "../base/ArrayToken";

export default class BooleanArray extends ArrayToken<boolean> {
  TryParse(value: string): boolean {
    return Util.HasValue(value) ? value.toLowerCase() == "true" : false;
  }
  constructor(...collection: Array<IToken<string>>) {
    super(...collection);
  }
}
