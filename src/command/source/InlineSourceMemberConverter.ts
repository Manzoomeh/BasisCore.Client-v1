import JoinMember from "./JoinMember";
import SqlMember from "./SqlMember";
import InMemoryMember from "./InMemoryMember";

export default class InlineSourceMemberConverter {
  static ConvertToMember(element: Element): InMemoryMember {
    var retVal: InMemoryMember = null;
    var type = element.getAttribute("format")?.toLowerCase();
    switch (type) {
      case "join": {
        retVal = new JoinMember(element);
        break;
      }
      case "sql": {
        retVal = new SqlMember(element);
        break;
      }
    }
    return retVal;
  }
}
