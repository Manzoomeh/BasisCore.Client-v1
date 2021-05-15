import IToken from "../../interface/IToken";
import ArrayToken from "../base/ArrayToken";

export default class IntegerArray extends ArrayToken<number> {
  TryParse(value: string): number {
    try {
      return parseInt(value);
    } catch {
      /*Nothing*/
    }
    return 0;
  }
  constructor(...collection: Array<IToken<string>>) {
    super(...collection);
  }
}
