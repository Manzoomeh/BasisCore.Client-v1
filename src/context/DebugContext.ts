import IDebugContext from "../interface/IDebugContext";
import IDebugInfo from "../interface/IDebugInfo";
import IHostSetting from "../interface/IHostSetting";

export default class DebugContext implements IDebugContext {
  readonly RequestId: string = "0";
  readonly InDebugMode: boolean;
  constructor(hostSetting: IHostSetting) {
    this.InDebugMode = hostSetting.Debug ?? false;
  }

  AddDebugInformation(debugInfo: IDebugInfo): void {
    throw new Error("Method not implemented.");
  }

  LogError(message: string, exception: Error): void {
    console.error(message, exception);
  }
  LogInformation(message: string): void {
    if (this.InDebugMode) {
      console.info(message);
    }
  }
  LogWarning(message: string): void {
    if (this.InDebugMode) {
      console.warn(message);
    }
  }
  Complete(): void {
    throw new Error("Method not implemented.");
  }
}
