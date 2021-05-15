import DbSourceMember from "./DbSourceMember";
import SourceCommand from "./SourceCommand";

export default class DbSource extends SourceCommand<DbSourceMember> {
  ConvertChildElementToMember(element: Element): DbSourceMember {
    return new DbSourceMember(element);
  }
  constructor(element: Element) {
    super(element);
  }
}
