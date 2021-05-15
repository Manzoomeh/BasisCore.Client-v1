import RenderingTurnContext from "../../context/RenderingTurnContext";
import ConstantDataSet from "../../dataset/ConstantDataSet";
import IDataSet from "../../dataset/IDataSet";
import StreamDataSet from "../../dataset/StreamDataSet";
import ClientException from "../../exception/ClientException";
import IContext from "../../interface/IContext";
import IStreamData from "../../interface/IConstantData";
import Util from "../../Util";
import CommandBase from "../CommandBase";
import Member from "./Member";
import { IDictionary } from "../../interface/IDictionary";
import IData from "../../interface/IData";

export default abstract class SourceCommand<
  T extends Member
> extends CommandBase {
  private streamManager: StreamDataSetManager;
  private oldConnectionName: string;
  abstract ConvertChildElementToMember(element: Element): T;
  constructor(element: Element) {
    super(element);
  }

  async ExecuteCommandAsync(turnContext: RenderingTurnContext): Promise<void> {
    var memberCount = this.Element.querySelectorAll("member").length;
    this.oldConnectionName = null;

    if (memberCount > 0) {
      var dataSet = await this.LoadDataAsync(turnContext);
      if (dataSet instanceof ConstantDataSet) {
        this.ProcessLoadedDatas(dataSet.Datas, turnContext);
      } else if (dataSet instanceof StreamDataSet) {
        this.streamManager = new StreamDataSetManager(
          dataSet,
          (x: IStreamData[]) => this.ProcessLoadedDatas(x, turnContext)
        );
        await this.streamManager.UntilConnected();
        this.streamManager = null;
      } else {
        throw new Error(
          `Invalid DataSet Type Receive From Provider:${dataSet}`
        );
      }
    }

    await this.ApplyResultAsync("", turnContext, true);
  }
  private async ProcessLoadedDatas(
    data: IData[],
    turnContext: RenderingTurnContext
  ) {
    var Members = new Array<T>();
    this.Element.querySelectorAll("member").forEach((elm) =>
      Members.push(this.ConvertChildElementToMember(elm))
    );
    if (Members.length != data.length) {
      throw new Error(
        `Command '${await turnContext.Name}' Has ${
          Members.length
        } Member(s) But ${data.length} Result(s) Returned From Source!`
      );
    }
    Members.forEach(async (member, index) => {
      var source = data[index];
      await member.AddDataSourceAsync(source, turnContext);
    });
  }

  async LoadDataAsync(turnContext: RenderingTurnContext): Promise<IDataSet> {
    var sourceName = await turnContext.Name;
    var connectionName = await this.GetAttributeValueAsync(
      "source",
      turnContext
    );
    if (this.oldConnectionName) {
      if (this.oldConnectionName !== connectionName) {
        throw new ClientException(
          `Source Attribute Can't Change in Existing Context. Valid Connection Is '${this.oldConnectionName}'`
        );
      }
    } else {
      this.oldConnectionName = connectionName;
    }
    var commnad = this.Element.outerHTML.ToStringToken();
    var params: any = {
      command: await Util.GetValueOrDefaultAsync(commnad, turnContext.Context),
      dmnid: turnContext.Context.GetDefault("dmnid", null),
    };
    var retVal: IDataSet = null;
    if (this.streamManager) {
      this.streamManager.SendDataAsync(params, turnContext.Context);
    } else {
      retVal = await turnContext.Context.LoadDataAsync(
        sourceName,
        connectionName,
        params
      );
    }
    return retVal;
  }

  async UpdateCommandAsync(turnContext: RenderingTurnContext): Promise<void> {
    await this.LoadDataAsync(turnContext);
  }

  protected async StopRenderingAsync(): Promise<void> {
    this.streamManager?.Close();
    this.streamManager = null;
  }
}

export class StreamDataSetManager {
  private readonly streamDataSet: StreamDataSet;
  private readonly callback: (x: IStreamData[]) => Promise<void>;

  constructor(
    streamDataSet: StreamDataSet,
    callback: (x: IStreamData[]) => Promise<void>
  ) {
    this.streamDataSet = streamDataSet;
    this.callback = callback;
    this.streamDataSet.OnDataReceiveEvent.Add(this.callback);
  }

  get IsConnected(): boolean {
    return this.streamDataSet.IsConnected ?? false;
  }

  async UntilConnected() {
    await this.streamDataSet.UntilConnected;
    this.streamDataSet.OnDataReceiveEvent.Remove(this.callback);
  }

  async SendDataAsync(
    parameters: IDictionary<string> = null,
    context?: IContext
  ): Promise<void> {
    if (this.streamDataSet.IsConnected) {
      await this.streamDataSet.SendDataAsync(parameters, context);
    } else {
      throw new ClientException("Connection closed");
    }
  }

  Close() {
    if (this.streamDataSet) {
      this.streamDataSet.Close();
    }
  }
}
