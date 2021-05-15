import RenderingTurnContext from "../context/RenderingTurnContext";
import ClientException from "../exception/ClientException";
import IDataSource from "../interface/IDataSource";
import Command from "./Command";

export default class UnknownCommand extends Command {
  constructor(element: Element) {
    super(element);
  }
  ExecuteAsyncEx(
    dataSource: IDataSource,
    turnContext: RenderingTurnContext
  ): Promise<void> {
    var core = this.Element.getAttribute("core")?.toLowerCase();
    throw new ClientException(
      `Invalid Core command.'${core}' command not implemented!`
    );
  }
}
