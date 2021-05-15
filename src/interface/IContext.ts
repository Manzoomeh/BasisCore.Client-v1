import IDataSet from "../dataset/IDataSet";
import IDataSource from "./IDataSource";
import IDebugContext from "./IDebugContext";
import { IDictionary } from "./IDictionary";
import IStreamData from "./IStreamData";

export default interface IContext {
  LoadDataAsync(
    sourceName: string,
    connectionName: string,
    parameters: IDictionary<string>
  ): Promise<IDataSet>;
  WaitToGetDataSourceAsync(dataSourceId: string): Promise<IDataSource>;
  AddDataSource(source: IDataSource): void;
  AddOrUpdateDataSource(data: IStreamData): IDataSource;
  TryRemoveDataSource(dataSourceId: string): boolean;
  TryGetDataSource(dataSourceId: string): IDataSource;
  AddPreview(source: IDataSource): void;
  LoadPageAsync(
    pageName: string,
    rawCommand: string,
    pageSize: string,
    callDepth: number
  ): Promise<string>;
  CheckSourceHeartbeatAsync(source: string): Promise<boolean>;

  GetDefault(key: string): string;
  GetDefault(key: string, defaultValue: string): string;
  DebugContext: IDebugContext;
  RenderToIsValid: boolean;
  Dispose();
}
