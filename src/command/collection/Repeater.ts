import ConstantData from "../../ConstantData";
import LocalContext from "../../context/LocalContext";
import RenderingTurnContext from "../../context/RenderingTurnContext";
import IDataSource from "../../interface/IDataSource";
import { ConstantDataSource } from "../../DataSource";
import Command from "../Command";
import Group from "./Group";
import ICommand from "../../interface/ICommand";

export default class Repeater extends Command {
  constructor(element: Element) {
    super(element);
  }

  async ExecuteAsyncEx(
    dataSource: IDataSource,
    turnContext: RenderingTurnContext
  ): Promise<void> {
    var name = await turnContext.Name;
    var groupTemplate = document.createElement("div");
    var tmp = Array.from(this.Element.childNodes);
    this.Element.appendChild(groupTemplate);
    tmp.forEach((node) => groupTemplate.appendChild(node.cloneNode(true)));
    var tasklist = new Array<Promise<void>>();

    var resultContainer = document.createElement("div");
    resultContainer.setAttribute("style", "display: none;");
    this.Element.appendChild(resultContainer);
    var renderToIsValid = await turnContext.GetCanUseRenderToAsync();
    dataSource?.Data?.Rows?.forEach(async (row) => {
      var localContext = new LocalContext(turnContext.Context, renderToIsValid);
      var tbl = new ConstantData(`${name}.current`, [{ ...row }]);
      localContext.AddDataSource(new ConstantDataSource(tbl));
      var element = <Element>groupTemplate.cloneNode(true);
      resultContainer.appendChild(element);
      var command: ICommand = new Group(element);
      tasklist.push(command.ExecuteAsync(localContext));
      localContext.Dispose();
    });
    await Promise.all(tasklist);

    groupTemplate.remove();

    var resultList = Array.from(resultContainer.childNodes);
    resultList.forEach((result) => {
      Array.from(result.childNodes).forEach((resultChild) =>
        resultContainer.appendChild(resultChild)
      );
      result.remove();
    });

    var result = resultContainer.innerHTML;
    resultContainer.remove();

    await super.ApplyResultAsync(result, turnContext, true);
  }
}
