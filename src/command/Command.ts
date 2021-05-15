import RenderingTurnContext from "../context/RenderingTurnContext";
import IDataSource from "../interface/IDataSource";
import CommandBase from "./CommandBase";

export default abstract class Command extends CommandBase {
  constructor(element: Element) {
    super(element);
  }
  async ExecuteCommandAsync(turnContext: RenderingTurnContext): Promise<void> {
    var dataSourceId = await this.GetAttributeValueAsync(
      "datamembername",
      turnContext
    );
    var source: IDataSource = null;
    if (dataSourceId) {
      source = await turnContext.Context.WaitToGetDataSourceAsync(dataSourceId);
    }
    return await this.ExecuteAsyncEx(source, turnContext);
  }
  abstract ExecuteAsyncEx(
    dataSource: IDataSource,
    context: RenderingTurnContext
  ): Promise<void>;
}
