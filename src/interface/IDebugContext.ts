import IDebugStep from "./IDebugStep";
import IDebugLogger from "./IDebugLogger";
import IDebugInfo from "./IDebugInfo";

export default interface IDebugContext extends IDebugLogger, IDebugStep {
  RequestId: string;
  AddDebugInformation(debugInfo: IDebugInfo): void;
  InDebugMode: boolean;
}
