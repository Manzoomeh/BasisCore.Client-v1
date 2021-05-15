import IConstantData from "../interface/IConstantData";
import IDataSet from "./IDataSet";

export default class ConstantDataSet implements IDataSet {
  constructor(datas: IConstantData[]) {
    this.Datas = datas || [];
  }
  readonly Datas: IConstantData[];
}
