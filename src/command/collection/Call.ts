import RenderingTurnContext from "../../context/RenderingTurnContext";
import Util from "../../Util";
import CommandBase from "../CommandBase";

export default class Call extends CommandBase {
  constructor(element: Element) {
    super(element);
  }

  async ExecuteCommandAsync(turnContext: RenderingTurnContext): Promise<void> {
    var filename = await this.GetAttributeValueAsync("file", turnContext);
    var pagesize = await this.GetAttributeValueAsync("pagesize", turnContext);
    var commnad = await Util.GetValueOrDefaultAsync(
      this.Element.outerHTML.ToStringToken(),
      turnContext.Context
    );
    var result = await turnContext.Context.LoadPageAsync(
      filename,
      commnad,
      pagesize,
      0
    );
    await this.ApplyResultAsync(result, turnContext, true);
  }
}
