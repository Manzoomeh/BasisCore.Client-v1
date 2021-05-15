import RenderingTurnContext from "../../context/RenderingTurnContext";
import IData from "../../interface/IData";
import RenderableBase from "../../renderable/RenderableBase";

export default class Callback extends RenderableBase {
  constructor(element: Element) {
    super(element);
  }

  async RenderDataAsync(
    data: IData,
    turnContext: RenderingTurnContext,
    replace: boolean
  ): Promise<void> {
    var method = await this.GetAttributeValueAsync("method", turnContext);
    var m = eval(method);
    try {
      m(data);
    } catch (e) {
      console.error(`error in execute callback method '${method}'.`, e);
    }
  }
}
