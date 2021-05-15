import IDataSet from "../dataset/IDataSet";
import StreamDataSet from "../dataset/StreamDataSet";
import IContext from "../interface/IContext";
import { IDictionary } from "../interface/IDictionary";
import ConnectionInfo from "./ConnectionInfo";

export default class WebSocketConnectionInfo extends ConnectionInfo {
  readonly Url: string;
  constructor(name: string, setting: any) {
    super(name);
    if (typeof setting === "string") {
      this.Url = setting;
    } else {
      this.Url = setting.Connection;
    }
  }
  TestConnectionAsync(context: IContext): Promise<boolean> {
    return Promise.resolve(true);
  }

  async LoadDataAsync(
    context: IContext,
    sourceName: string,
    parameters: IDictionary<string>
  ): Promise<IDataSet> {
    var retVal = new StreamDataSet(this, context);
    await retVal.SendDataAsync(parameters);
    return retVal;
  }

  LoadPageAsync(
    context: IContext,
    pageName: string,
    parameters: IDictionary<string>
  ): Promise<string> {
    throw new Error("WebSocket Call Not Implemented.");
  }
}
