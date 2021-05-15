import ConstantData from "../ConstantData";
import ConstantDataSet from "../dataset/ConstantDataSet";
import IDataSet from "../dataset/IDataSet";
import IContext from "../interface/IContext";
import { IDictionary } from "../interface/IDictionary";
import Util from "../Util";
import ConnectionInfo from "./ConnectionInfo";

export default class WebConnectionInfo extends ConnectionInfo {
  readonly Url: string;
  readonly Verb: string;
  readonly Heartbeat: string;
  readonly HeartbeatVerb: string;
  constructor(name: string, setting: any) {
    super(name);
    if (typeof setting === "string") {
      this.Url = setting;
    } else {
      this.Url = setting.Connection;
      this.Heartbeat = setting.Heartbeat;
      this.Verb = setting.Verb;
      this.HeartbeatVerb = setting.HeartbeatVerb;
    }
  }
  async TestConnectionAsync(context: IContext): Promise<boolean> {
    var isOk: boolean;
    if (Util.HasValue(this.Heartbeat)) {
      try {
        await Util.Ajax(
          this.Heartbeat,
          this.HeartbeatVerb ??
            context.GetDefault("source.heartbeatVerb", "get")
        );
        isOk = true;
      } catch {
        isOk = false;
      }
    } else {
      isOk = true;
    }
    return isOk;
  }
  async LoadDataAsync(
    context: IContext,
    sourceName: string,
    parameters: IDictionary<string> = null
  ): Promise<IDataSet> {
    var rawJson = await Util.Ajax(
      this.Url,
      this.Verb ?? context.GetDefault("source.verb", "post"),
      parameters
    );
    var json = this.ParseJsonString(rawJson);
    return new ConstantDataSet(
      json.Tables.map((x) => new ConstantData(x.Key, x.Value))
    );
  }
  async LoadPageAsync(
    context: IContext,
    pageName: string,
    parameters: IDictionary<string>
  ): Promise<string> {
    return await Util.Ajax(
      `${this.Url}${pageName}`,
      this.Verb ?? context.GetDefault("call.verb", "post"),
      parameters
    );
  }
}
