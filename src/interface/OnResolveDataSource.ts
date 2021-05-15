import IDataSource from "./IDataSource";

export default interface OnResolveDataSource {
  (datasource: IDataSource): void;
}
