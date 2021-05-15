import Data from "./Data";
import IConstantData from "./interface/IConstantData";

export default class ConstantData extends Data implements IConstantData {
  constructor(name: string, rows: Array<any> = []) {
    super(name, rows);
  }

  public static FromObject(object: any, name: string): ConstantData {
    var retVal = new ConstantData(name, Object.getOwnPropertyNames(object));
    retVal.Rows = [object];
    return retVal;
  }
}
