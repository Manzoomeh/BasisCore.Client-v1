import IConnectionSetting from "./IConnectionSetting";
import { IDictionary } from "./IDictionary";

export default interface IHostSetting {
  Debug: boolean;
  AutoRender: boolean;
  ServiceWorker: boolean;
  Settings: IDictionary<string | any | IConnectionSetting>;
  OnRendered: { (element: Element): void };
  OnRendering: { (element: Element): boolean };
  Sources: { [key: string]: Array<any[]> };
  DbLibPath: string;
}
