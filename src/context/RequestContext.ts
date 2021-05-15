import Group from "../command/collection/Group";
import CommandMaker from "../command/CommandMaker";
import ConnectionInfoManager from "../connectionInfo/ConnectionInfoManager";
import IDataSet from "../dataset/IDataSet";
import ConfigNotFoundException from "../exception/ConfigNotFoundException";
import IContext from "../interface/IContext";
import IDataSource from "../interface/IDataSource";
import IDebugContext from "../interface/IDebugContext";
import { IDictionary } from "../interface/IDictionary";
import IHostSetting from "../interface/IHostSetting";
import Util from "../Util";
import BasisCore from "./BasisCore";
import Context from "./Context";
import LocalContext from "./LocalContext";

declare var host: IHostSetting;

export default class RequestContext extends Context {
  DataSourceAdded(source: IDataSource) {
    throw new Error("Method not implemented.");
  }

  HostSetting: IHostSetting;
  Connections: ConnectionInfoManager;

  constructor(debugContext: IDebugContext) {
    super(debugContext, true);
    this.HostSetting = host;
    this.AddLocalDataAsDataSource();
    this.Connections = new ConnectionInfoManager(host);
  }

  async RenderAsync(
    selector: string,
    initContext?: { (context: IContext): void }
  ): Promise<void>;
  async RenderAsync(
    element?: Element,
    initContext?: { (context: IContext): void }
  ): Promise<void>;
  async RenderAsync(
    elementList: NodeListOf<Element>,
    initContext?: { (context: IContext): void }
  ): Promise<void>;
  async RenderAsync(
    param?: any,
    initContext?: { (context: IContext): void }
  ): Promise<void> {
    await BasisCore.Current._initializeTask;
    if (!Util.HasValue(param)) {
      param = document.documentElement;
    }
    var elements: Array<Element>;
    if (typeof param === "string") {
      elements = Array.from(document.querySelectorAll(param));
    } else if (param instanceof Element) {
      elements = [param];
    } else if (param instanceof NodeList) {
      elements = Array.from(<NodeListOf<Element>>param);
    }
    var tasks = Array<Promise<void>>();
    elements.forEach((elm) =>
      tasks.push(this.RenderElementAsync(elm, initContext))
    );
    await Promise.all(tasks);
  }

  private async RenderElementAsync(
    element: Element,
    initContext?: { (context: IContext): void }
  ): Promise<void> {
    var rejected = false;
    try {
      if (this.HostSetting.OnRendering) {
        var reason = this.HostSetting.OnRendering(element);
        if (reason) {
          rejected = true;
          throw new Error("Cancel In Call OnRendering");
        }
      }
    } catch (ex) {
      this.DebugContext.LogError(
        "Error in Execute Host.OnRendering Method",
        ex
      );
    }
    var tryInitContext = (context: IContext): IContext => {
      var retVal = context;
      if (initContext) {
        if (retVal == this) {
          retVal = new LocalContext(context, this.RenderToIsValid);
        }
        try {
          initContext(retVal);
        } catch (er) {
          this.DebugContext.LogError(`Error In Run 'initContext' CallBack`, er);
        }
      }
      return retVal;
    };
    if (!rejected) {
      if (element.IsBasisCore()) {
        var localContext = tryInitContext(
          new LocalContext(this, this.RenderToIsValid)
        );
        await CommandMaker.ToCommand(element).ExecuteAsync(localContext);
        localContext.Dispose();
      } else {
        var localContext = tryInitContext(this);
        await new Group(element).ExecuteAsync(localContext);
        localContext.Dispose();
      }
      try {
        if (this.HostSetting.OnRendered) {
          this.HostSetting.OnRendered(element);
        }
      } catch (ex) {
        this.DebugContext.LogError("Error In Run Host.OnRendered Method", ex);
      }
    }
  }

  private AddLocalDataAsDataSource() {
    var cookieValues = document.cookie.split(";").map((x) => x.split("="));
    var data = new Array<string[]>();
    data.push(cookieValues.map((x) => x[0]));
    data.push(cookieValues.map((x) => x[1]));
    Util.AddToContextAsync(Util.ToDataTable("cms.cookie", data), this);
    var request = new Array<string[]>();
    request.push(["requestId", "hostip", "hostport"]);
    request.push(["-1", window.location.hostname, window.location.port]);
    Util.AddToContextAsync(Util.ToDataTable("cms.request", request), this);
    var toTwoDigit = (x) => ("0" + x).slice(-2);
    var d = new Date();
    var ye = d.getFullYear();
    var mo = toTwoDigit(d.getMonth());
    var da = toTwoDigit(d.getDay());
    var ho = toTwoDigit(d.getHours());
    var mi = toTwoDigit(d.getMinutes());
    var se = toTwoDigit(d.getSeconds());
    var cms = new Array<string[]>();
    cms.push(["Date", "Time", "Date2", "Time2", "Date3"]);
    cms.push([
      `${ye}/${mo}/${da}`,
      `${ho}:${mi}`,
      `${ye}${mo}${da}`,
      `${ho}${mi}${se}`,
      `${ye}.${mo}.${da}`,
    ]);
    Util.AddToContextAsync(Util.ToDataTable("cms.cms", cms), this);

    if (this.HostSetting.Sources) {
      Object.getOwnPropertyNames(this.HostSetting.Sources).forEach((key) => {
        Util.AddToContextAsync(
          Util.ToDataTable(key.toLowerCase(), this.HostSetting.Sources[key]),
          this
        );
      });
    }
  }
  public AddQueryString(queryString: string) {
    if (queryString.length > 0) {
      var querykeys = new Array<string>();
      var queryValues = new Array<string>();
      queryString.split("&").forEach((x) => {
        var pair = x.split("=");
        querykeys.push(pair[0]);
        queryValues.push(decodeURIComponent(pair[1] || ""));
      });
      Util.AddToContextAsync(
        Util.ToDataTable("cms.query", [querykeys, queryValues]),
        this
      );
    }
  }
  async LoadPageAsync(
    pageName: string,
    rawCommand: string,
    pageSize: string,
    callDepth: number
  ): Promise<string> {
    var parameters: any = {
      fileNames: pageName,
      dmnid: this.GetDefault("dmnid", ""),
      sitesize: pageSize,
      command: rawCommand,
    };
    var connectionInfo = this.Connections.GetConnection("callcommand");
    return await connectionInfo.LoadPageAsync(this, pageName, parameters);
  }

  LoadDataAsync(
    sourceName: string,
    connectionName: string,
    parameters: IDictionary<string>
  ): Promise<IDataSet> {
    var connectionInfo = this.Connections.GetConnection(connectionName);
    return connectionInfo.LoadDataAsync(this, sourceName, parameters);
  }

  _checkedSourceHeartbeat: IDictionary<Promise<boolean>> = {};

  async CheckSourceHeartbeatAsync(source: string): Promise<boolean> {
    var retVal = this._checkedSourceHeartbeat[source];
    if (!Util.HasValue(retVal)) {
      var connectionInfo = this.Connections.GetConnection(source);
      retVal = connectionInfo.TestConnectionAsync(this);
    }
    return await retVal;
  }
  GetSetting(key: string, defaultValue: string): any {
    var find = Object.getOwnPropertyNames(this.HostSetting.Settings).filter(
      (x) => Util.IsEqual(x, key)
    );
    var retVal = find.length == 1 ? host.Settings[find[0]] : null;
    if (!retVal) {
      if (defaultValue !== undefined) {
        retVal = defaultValue;
      } else {
        throw new ConfigNotFoundException("host.settings", key);
      }
    }
    return retVal;
  }
  GetDefault(key: string): string;
  GetDefault(key: string, defaultValue: string): string;
  GetDefault(key: any, defaultValue?: any): string {
    return this.GetSetting(`default.${key}`, defaultValue);
  }

  private _previewContainer: Element;
  AddPreview(source: IDataSource): void {
    var str: string = "";
    source.Data.Rows.forEach((row) => {
      str += "<tr>";
      Object.getOwnPropertyNames(row).forEach((col) => {
        var value = row[col];
        str += `<td>${Util.HasValue(value) ? value : ""}</td>`;
      });
      str += "</tr>";
    });
    var columnNameList = "";
    var columnIndexList = "";
    source.Data.Columns.forEach((col, index) => {
      columnIndexList += `<td>col${index + 1}</td>`;
      columnNameList += `<td>${col}</td>`;
    });
    str = `<thead><tr><td colspan='${source.Data.Columns.length}'>${source.Data.Name}</td></tr><tr>${columnIndexList}</tr><tr>${columnNameList}</tr></thead><tbody>${str}</tbody> `;
    var tbl = document.createElement("table");
    tbl.innerHTML = str;
    if (!Util.HasValue(this._previewContainer)) {
      this._previewContainer = document.createElement("div");
      this._previewContainer.setAttribute(
        "data-basiscore-preview-container",
        ""
      );
      document.body.appendChild(this._previewContainer);
    }
    this._previewContainer.appendChild(tbl);
  }
  TryGetDataSource(dataSourceId: string): IDataSource {
    dataSourceId = dataSourceId?.toLowerCase();
    return this.Repository.get(dataSourceId);
  }
  WaitToGetDataSourceAsync(dataSourceId: string): Promise<IDataSource> {
    throw new Error(
      `Call WaitToGetDataSourceAsync In RequestContext For '${dataSourceId}'.No DataSource Add To this Context Dynamically.`
    );
  }
}
