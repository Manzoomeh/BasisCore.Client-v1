import IDataSet from "../dataset/IDataSet";
import IContext from "../interface/IContext";
import IDataSource from "../interface/IDataSource";
import IDebugContext from "../interface/IDebugContext";
import { StreamDataSource } from "../DataSource";
import { IDictionary } from "../interface/IDictionary";
import IStreamData from "../interface/IStreamData";

export default abstract class Context implements IContext {
  readonly DebugContext: IDebugContext;
  readonly Repository: Map<string, IDataSource> = new Map();
  readonly RenderToIsValid: boolean;

  constructor(debugContext: IDebugContext, renderToIsValid: boolean) {
    this.DebugContext = debugContext;
    this.RenderToIsValid = renderToIsValid;
  }
  TryRemoveDataSource(dataSourceId: string): boolean {
    var retVal = true;
    var source = this.Repository.get(dataSourceId);
    if (source !== undefined) {
      this.Repository.delete(dataSourceId);
      this.DebugContext.LogInformation(`${dataSourceId} Removed`);
    } else {
      this.DebugContext.LogInformation(`${dataSourceId} Not Found For Remove`);
      retVal = false;
    }
    return retVal;
  }

  abstract LoadPageAsync(
    pageName: string,
    rawCommand: string,
    pageSize: string,
    callDepth: number
  ): Promise<string>;
  abstract GetDefault(key: string): string;
  abstract GetDefault(key: string, defaultValue: string): string;
  abstract GetDefault(key: any, defaultValue?: any): string;
  abstract AddPreview(source: IDataSource): void;
  abstract LoadDataAsync(
    sourceName: string,
    connectionName: string,
    parameters: IDictionary<string>
  ): Promise<IDataSet>;
  abstract TryGetDataSource(dataSourceId: string): IDataSource;
  abstract WaitToGetDataSourceAsync(dataSourceId: string): Promise<IDataSource>;
  abstract CheckSourceHeartbeatAsync(source: string): Promise<boolean>;

  AddDataSource(source: IDataSource): void {
    this.Repository.set(source.Data.Name, source);
    this.DebugContext.LogInformation(`${source.Data.Name} Added`);
  }
  AddOrUpdateDataSource(data: IStreamData): IDataSource {
    var retVal = this.Repository.get(data.Name);
    if (retVal === undefined) {
      retVal = new StreamDataSource(data);
      this.Repository.set(data.Name, retVal);
      this.DebugContext.LogInformation(`${data.Name} Added`);
    } else {
      if (retVal instanceof StreamDataSource) {
        retVal.Update(data);
        this.DebugContext.LogInformation(`${data.Name} Updated`);
      } else {
        throw Error(
          `Call Context::AddOrUpdateDataSource For Non Stream DataSource ${data.Name}`
        );
      }
    }
    return retVal;
  }
  Dispose() {}
}
