import CommandMaker from "../command/CommandMaker";
import ConstantData from "../ConstantData";
import ClientException from "../exception/ClientException";
import IBasisCore from "../interface/IBasisCore";
import ICommandInfo from "../interface/ICommandInfo";
import IContext from "../interface/IContext";
import IDataSource from "../interface/IDataSource";
import IDebugContext from "../interface/IDebugContext";
import IHostSetting from "../interface/IHostSetting";
import Util from "../Util";
import DebugContext from "./DebugContext";
import RequestContext from "./RequestContext";

declare var alasql: any;
declare var host: IHostSetting;

export default class BasisCore implements IBasisCore {
  static Current: BasisCore = null;
  public readonly Context: RequestContext;
  private constructor() {
    if (typeof host === "undefined") {
      throw new ClientException("host object not found");
    }
    this.Context = new RequestContext(new DebugContext(host));
  }

  GetCommand(selector: string): ICommandInfo;
  GetCommand(element?: Element): ICommandInfo;
  GetCommand(param?: any): ICommandInfo {
    var element: Element;
    if (typeof param === "string") {
      element = document.querySelector(param);
    } else if (param instanceof Element) {
      element = param;
    } else {
      throw new ClientException("Invalid Argument");
    }
    var command = CommandMaker.ToCommand(element);
    return command.Info;
  }
  //TODO:Must Remove
  public _initializeTask: Promise<void>;
  static CreateAndInitialize() {
    if (BasisCore.Current === null) {
      BasisCore.Current = new BasisCore();
      BasisCore.Current._initializeTask = new Promise((resolve) => {
        if (
          navigator.serviceWorker &&
          navigator.serviceWorker.controller &&
          (BasisCore.Current.Context.HostSetting.ServiceWorker ?? true)
        ) {
          var eventHandler = (event) => {
            var data = event.data;
            console.info(data);
            BasisCore.Current.DebugContext.LogInformation(
              `The service worker sent a message of type '${data.Type}'`
            );
            if (data.Type === "response-info") {
              try {
                var url = new URL(data.Data.Url);
                var query = window.location.search.substring(1);
                if (url.search.length > 0) {
                  query = url.search.substring(1);
                }
                BasisCore.Current.Context.AddQueryString(query);
                resolve();
              } catch (ex) {
                BasisCore.Current.DebugContext.LogError(
                  "Error in get service worker response query string",
                  ex
                );
              }
              navigator.serviceWorker.removeEventListener(
                "message",
                eventHandler
              );
            }
          };
          navigator.serviceWorker.addEventListener("message", eventHandler);
          navigator.serviceWorker.ready.then((registration) => {
            BasisCore.Current.DebugContext.LogInformation(
              `Send 'response-info' message for service worker`
            );
            registration.active.postMessage({ Type: "response-info" });
          });
        } else {
          var query = window.location.search.substring(1);
          BasisCore.Current.Context.AddQueryString(query);
          resolve();
        }
      });
    }
  }

  async GetOrLoadDbLibAsync(): Promise<any> {
    var retVal;
    if (typeof alasql === "undefined") {
      if (Util.IsNullOrEmpty(this.Context.HostSetting.DbLibPath)) {
        throw new ClientException(
          `Error in load 'alasql'. 'DbLibPath' Not Configure Properly In Host Object.`
        );
      }
      retVal = await this.GetOrLoadObjectAsync(
        "alasql",
        this.Context.HostSetting.DbLibPath
      );
    } else {
      retVal = alasql;
    }
    return retVal;
  }

  public GetOrLoadObjectAsync(object: string, url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (eval(`typeof(${object})`) === "undefined") {
        var script = document.createElement("script");
        script.onload = (x) => resolve(eval(object));
        script.onerror = (x) => reject(x);
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", url);
        document.getElementsByTagName("head")[0].appendChild(script);
      } else {
        resolve(eval(object));
      }
    });
  }

  public async RenderAsync(
    selector: string,
    initContext?: (context: IContext) => void
  ): Promise<void>;
  public async RenderAsync(
    element?: Element,
    initContext?: (context: IContext) => void
  ): Promise<void>;
  public async RenderAsync(
    elements?: NodeListOf<Element>,
    initContext?: (context: IContext) => void
  ): Promise<void>;
  public async RenderAsync(elements?: any, initContext?: any) {
    return await this.Context.RenderAsync(elements, initContext);
  }

  public async WaitToGetDataSourceAsync(
    selector: string,
    dataSourceId: string
  ): Promise<IDataSource> {
    var command = CommandMaker.ToCommand(document.querySelector(selector));
    if (command.Info.CurrentContext) {
      return await command.Info.CurrentContext.Context.WaitToGetDataSourceAsync(
        dataSourceId
      );
    } else {
      return new Promise((resolve) => {
        var handler = async (x) => {
          var source = await x.Context.WaitToGetDataSourceAsync(dataSourceId);
          command.Info.OnRendering.Remove(handler);
          console.log("remove", command.Info.OnRendering);
          resolve(source);
        };
        command.Info.OnRendering.Add(handler);
        console.log("add", command.Info.OnRendering);
      });
    }
  }
  public TryGetDataSource(dataSourceId: string): IDataSource {
    return this.Context.TryGetDataSource(dataSourceId);
  }
  public GetDefault(key: string): string;
  public GetDefault(key: string, defaultValue: string): string;
  public GetDefault(key: any, defaultValue?: any) {
    return this.Context.GetDefault(key, defaultValue);
  }
  public get DebugContext(): IDebugContext {
    return this.Context.DebugContext;
  }
  public async AddDataSourceAsync(
    source: IDataSource,
    context: IContext = null,
    preview: boolean = false,
    sort: string = null,
    postSql: string = null
  ): Promise<void> {
    await Util.AddToContextAsync(
      source.Data,
      context ?? this.Context,
      preview,
      sort,
      postSql
    );
  }
  public async AddObjectAsync(
    object: any,
    name: string,
    context: IContext = null,
    preview: boolean = false,
    sort: string = null,
    postSql: string = null
  ): Promise<void> {
    var tbl = ConstantData.FromObject(object, name);
    await Util.AddToContextAsync(
      tbl,
      context ?? this.Context,
      preview,
      sort,
      postSql
    );
  }

  public TryRemoveDataSource(dataSourceId: string, context: IContext = null) {
    return (context ?? this.Context).TryRemoveDataSource(dataSourceId);
  }
}
