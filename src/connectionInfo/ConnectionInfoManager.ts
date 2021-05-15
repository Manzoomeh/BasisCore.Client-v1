import ConfigNotFoundException from "../exception/ConfigNotFoundException";
import IHostSetting from "../interface/IHostSetting";
import ConnectionInfo from "./ConnectionInfo";
import LocalStorageConnectionInfo from "./LocalStorageConnectionInfo";
import WebConnectionInfo from "./WebConnectionInfo";
import WebSocketConnectionInfo from "./WebSocketConnectionInfo";

export default class ConnectionInfoManager {
  private readonly connections: Map<string, ConnectionInfo> = new Map();
  constructor(host: IHostSetting) {
    Object.getOwnPropertyNames(host.Settings)
      .map((x) => {
        var parts = x.split(".", 3);
        return {
          type: parts[0]?.trim().toLowerCase(),
          provider: parts[1]?.trim().toLowerCase(),
          name: parts[2],
          value: host.Settings[x],
        };
      })
      .filter((x) => x.type.IsEqual("connection"))
      .forEach((x) => {
        var obj: ConnectionInfo;
        switch (x.provider) {
          case "web": {
            obj = new WebConnectionInfo(x.name, x.value);
            break;
          }
          case "websocket": {
            obj = new WebSocketConnectionInfo(x.name, x.value);
            break;
          }
          case "local": {
            obj = new LocalStorageConnectionInfo(x.name, x.value);
            break;
          }
        }
        this.connections.set(obj.Name, obj);
      });
  }

  GetConnection(connectionName: string): ConnectionInfo {
    var retVal = this.connections.get(connectionName);
    if (retVal === undefined) {
      throw new ConfigNotFoundException("host.settings", connectionName);
    }
    return retVal;
  }
}
