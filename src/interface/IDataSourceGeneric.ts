import { DataSourceType } from "../enum/DataSourceType";
import IData from "./IData";

export default interface IDataSourceGeneric<T> {
  Type: DataSourceType;
  Data: IData;
}
