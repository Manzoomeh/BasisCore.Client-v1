import IDataSet from "../dataset/IDataSet";
import EventManager from "../dataset/EventManager";
import IContext from "../interface/IContext";
import IDataSource from "../interface/IDataSource";
import Context from "./Context";
import { IDictionary } from "../interface/IDictionary";
import IStreamData from "../interface/IStreamData";

export default class LocalContext extends Context {
  async CheckSourceHeartbeatAsync(source: string): Promise<boolean> {
    return await this.Owner.CheckSourceHeartbeatAsync(source);
  }
  readonly Resolves: Map<string, EventManager<IDataSource>>;
  readonly OnDataSourceAdded: EventManager<IDataSource>;

  AddPreview(source: IDataSource): void {
    this.Owner.AddPreview(source);
  }

  async LoadDataAsync(
    sourceName: string,
    connectionName: string,
    parameters: IDictionary<string>
  ): Promise<IDataSet> {
    return await this.Owner.LoadDataAsync(
      sourceName,
      connectionName,
      parameters
    );
  }
  async LoadPageAsync(
    pageName: string,
    rawCommand: string,
    pageSize: string,
    callDepth: number
  ): Promise<string> {
    return await this.Owner.LoadPageAsync(
      pageName,
      rawCommand,
      pageSize,
      callDepth
    );
  }
  readonly Owner: IContext;
  constructor(owner: IContext, renderToIsValid: boolean) {
    super(owner.DebugContext, renderToIsValid);
    this.Resolves = new Map();
    this.OnDataSourceAdded = new EventManager<IDataSource>();
    this.Owner = owner;
    if (owner instanceof LocalContext) {
      owner.OnDataSourceAdded.Add(this.OnDataSourceAddedHandler);
    }
  }
  Dispose() {
    super.Dispose();
    if (this.Owner instanceof LocalContext) {
      this.Owner.OnDataSourceAdded.Remove(this.OnDataSourceAddedHandler);
    }
  }
  private OnDataSourceAddedHandler(source: IDataSource) {
    var handler = this.Resolves.get(source.Data.Name);
    if (handler) {
      handler.Trigger(source);
      this.Resolves.delete(source.Data.Name);
    }
    this.OnDataSourceAdded.Trigger(source);
  }
  GetDefault(key: string): string;
  GetDefault(key: string, defaultValue: string): string;
  GetDefault(key: any, defaultValue?: any): string {
    return this.Owner.GetDefault(key, defaultValue);
  }
  TryGetDataSource(dataSourceId: string): IDataSource {
    dataSourceId = dataSourceId?.toLowerCase();
    return (
      this.Repository.get(dataSourceId) ??
      this.Owner.TryGetDataSource(dataSourceId)
    );
  }

  WaitToGetDataSourceAsync(dataSourceId: string): Promise<IDataSource> {
    return new Promise<IDataSource>((resolve, reject) => {
      var retVal = this.TryGetDataSource(dataSourceId);
      if (retVal) {
        resolve(retVal);
      } else {
        dataSourceId = dataSourceId?.toLowerCase();
        this.DebugContext.LogInformation(`wait for ${dataSourceId}`);
        var handler = this.Resolves.get(dataSourceId);
        if (!handler) {
          handler = new EventManager<IDataSource>();
          this.Resolves.set(dataSourceId, handler);
        }
        handler.Add(resolve);
      }
    });
  }
  AddDataSource(source: IDataSource): void {
    super.AddDataSource(source);
    this.OnDataSourceAddedHandler(source);
  }
  AddOrUpdateDataSource(data: IStreamData): IDataSource {
    var retVal = super.AddOrUpdateDataSource(data);
    this.OnDataSourceAddedHandler(retVal);
    return retVal;
  }
}
