import RenderingTurnContext from "../../context/RenderingTurnContext";
import IData from "../../interface/IData";
import Member from "./Member";

export default abstract class InMemoryMember extends Member {
  constructor(element: Element) {
    super(element);
  }
  async AddDataSourceExAsync(context: RenderingTurnContext): Promise<void> {
    var source = await this.ParseDataAsync(context);
    if (source) {
      super.AddDataSourceAsync(source, context);
    }
  }

  abstract ParseDataAsync(context: RenderingTurnContext): Promise<IData>;
}
