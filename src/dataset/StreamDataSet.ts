import WebSocketConnectionInfo from "../connectionInfo/WebSocketConnectionInfo";
import IContext from "../interface/IContext";
import IEvent from "../interface/IEvent";
import IEventManager from "../interface/IEventManager";
import StreamData from "../StreamData";
import IDataSet from "./IDataSet";
import Deffer from "./Deffer";
import EventManager from "./EventManager";
import { IDictionary } from "../interface/IDictionary";
import IStreamData from "../interface/IStreamData";

export default class StreamDataSet implements IDataSet {
  Socket: WebSocket;
  Context: IContext;
  readonly _def: Deffer<void>;

  readonly Owner: WebSocketConnectionInfo;

  get UntilConnected(): Promise<void> {
    return this._def.Promise;
  }
  get IsConnected(): boolean {
    return this.Socket.readyState === WebSocket.OPEN;
  }
  readonly OnDataReceiveEvent: IEvent<IStreamData[]>;
  private EventManager: IEventManager<IStreamData[]>;
  Setting: any;
  private Error: any;

  constructor(owner: WebSocketConnectionInfo, context: IContext) {
    this.Owner = owner;
    this.Context = context;
    this._def = new Deffer<void>();
    var ev = new EventManager<IStreamData[]>();
    this.OnDataReceiveEvent = ev;
    this.EventManager = ev;
    this.InitWebSocket(false);
  }

  private InitWebSocket(reconnect: boolean) {
    this.Socket = new WebSocket(this.Owner.Url);
    this.Socket.onopen = (e) =>
      this.Context.DebugContext.LogInformation(
        `${this.Owner.Url} ${reconnect ? "RE" : ""}CONNECTED`
      );
    this.Socket.onclose = (e) => {
      if (this.Error != null) {
        console.log(`Try Reconnect To '${this.Owner.Url}'`);
        this.InitWebSocket(true);
        this.Error = null;
      } else {
        this._def.Resolve();
        this.Context.DebugContext.LogInformation(
          `${this.Owner.Url} DISCONNECTED`
        );
      }
    };
    this.Socket.onerror = (e) => {
      console.log(`Error On '${this.Owner.Url}'`);
      this.Context.DebugContext.LogError(
        `Error On '${this.Owner.Url}'`,
        <any>e
      );
      this.Error = e;
    };
    this.Socket.onmessage = (e) => {
      try {
        this.ProcessMessage(e.data);
      } catch (ex) {
        this.Context.DebugContext.LogError(
          "Error In Call WebSocketConnection::ProcessMessage",
          ex
        );
      }
    };
  }

  ProcessMessage(rawJson: string) {
    var json = this.Owner.ParseJsonString(rawJson);
    var datas = json.Tables.map(
      (x) => new StreamData(x.Key, x.Value, json.Setting, this.UntilConnected)
    );
    this.EventManager.Trigger(datas);
  }

  async SendDataAsync(
    parameters: IDictionary<string> = null,
    context?: IContext
  ): Promise<void> {
    if (context) {
      this.Context = context;
    }
    while (!this.IsConnected) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    this.Socket.send(JSON.stringify(parameters));
  }

  Close() {
    this.EventManager.Clear();
    this.Socket.close();
  }
}
