import RenderingTurnContext from "../../context/RenderingTurnContext";
import SourceCommand from "./SourceCommand";
import InlineSourceMemberConverter from "./InlineSourceMemberConverter";
import InMemoryMember from "./InMemoryMember";

export default class InlineSource extends SourceCommand<InMemoryMember> {
  ConvertChildElementToMember(element: Element): InMemoryMember {
    return InlineSourceMemberConverter.ConvertToMember(element);
  }
  constructor(element: Element) {
    super(element);
  }

  async ExecuteCommandAsync(turnContext: RenderingTurnContext): Promise<void> {
    var Members = new Array<InMemoryMember>();
    this.Element.querySelectorAll("member").forEach((elm) =>
      Members.push(this.ConvertChildElementToMember(elm))
    );
    if ((Members?.length || 0) > 0) {
      var tasks = Array<Promise<void>>();
      Members.forEach((member) =>
        tasks.push(member.AddDataSourceExAsync(turnContext))
      );
      await Promise.all(tasks);
    }
  }
}
