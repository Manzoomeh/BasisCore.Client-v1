import Data from "./Data";
import IStreamData from "./interface/IStreamData";

export default class StreamData extends Data implements IStreamData {
  IsEnd: boolean;
  Replace: boolean;
  readonly UntilConnected: Promise<void>;
  constructor(
    name: string,
    rows: Array<any> = [],
    setting: any,
    untilConnected: Promise<void>
  ) {
    super(name, rows);
    this.UntilConnected = untilConnected;
    if (setting) {
      this.IsEnd = setting.IsEnd || false;
      this.Replace = setting.Replace || false;
    }
  }
}
