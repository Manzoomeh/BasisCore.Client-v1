import EventManager from "./dataset/EventManager";
import { DataSourceType } from "./enum/DataSourceType";
import IConstantData from "./interface/IConstantData";
import IData from "./interface/IData";
import IDataSource from "./interface/IDataSource";
import IEvent from "./interface/IEvent";
import IEventManager from "./interface/IEventManager";
import IStreamData from "./interface/IStreamData";

export abstract class DataSource {
  readonly Type: DataSourceType;

  constructor(type: DataSourceType) {
    this.Type = type;
  }
}
export class ConstantDataSource extends DataSource implements IDataSource {
  Data: IData;
  constructor(data: IConstantData) {
    super(DataSourceType.Table);
    this.Data = data;
  }
}

export class StreamDataSource extends DataSource implements IDataSource {
  Data: IStreamData;
  readonly OnDataUpdateEvent: IEvent<IStreamData>;
  private EventManager: IEventManager<IStreamData>;
  readonly UntilConnected: Promise<void>;

  constructor(table: IStreamData) {
    super(DataSourceType.Table);
    this.Data = table;
    var ev = new EventManager<IStreamData>();
    this.OnDataUpdateEvent = ev;
    this.EventManager = ev;
    this.UntilConnected = table.UntilConnected;
  }

  Update(data: IStreamData) {
    this.Data = data;
    this.EventManager.Trigger(data);
  }
}
