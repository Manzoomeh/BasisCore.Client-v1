import RequestContext from "../context/RequestContext";
import ICommandInfo from "./ICommandInfo";
import IContext from "./IContext";
import IDataSource from "./IDataSource";
import IDebugContext from "./IDebugContext";

export default interface IBasisCore {
    Context: RequestContext;
    RenderAsync(selector: string, initContext?: { (context: IContext): void }): Promise<void>;
    RenderAsync(element?: Element, initContext?: { (context: IContext): void }): Promise<void>;
    RenderAsync(elements?: NodeListOf<Element>, initContext?: { (context: IContext): void }): Promise<void>;
    WaitToGetDataSourceAsync(selector: string, dataSourceId: string): Promise<IDataSource>;
    TryGetDataSource(dataSourceId: string): IDataSource;
    GetDefault(key: string): string;
    GetDefault(key: string, defaultValue: string): string;
    DebugContext: IDebugContext;
    AddDataSourceAsync(source: IDataSource, context: IContext, preview: boolean, sort: string, postSql: string): Promise<void>
    AddObjectAsync(object: any, name: string, context: IContext, preview: boolean, sort: string, postSql: string): Promise<void>
    GetOrLoadDbLibAsync(): Promise<any>;
    GetOrLoadObjectAsync(object: string, url: string): Promise<any>;

    GetCommand(selector: string): ICommandInfo;
    GetCommand(element?: Element): ICommandInfo;
}
