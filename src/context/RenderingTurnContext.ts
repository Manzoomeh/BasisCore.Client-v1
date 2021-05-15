import { RenderType } from "../enum/RenderType";
import { RunType } from "../enum/RunType";
import IContext from "../interface/IContext";
import IToken from "../interface/IToken";
import Util from "../Util";

export default class RenderingTurnContext {
  readonly lookup: Map<string, any> = new Map();

  readonly Context: IContext;
  readonly Element: Element;

  private static async BooleanConvertorAsync(
    token: IToken<string>,
    context: IContext,
    defaultValue: boolean
  ) {
    var retVal = defaultValue;
    var value = await Util.GetValueOrDefaultAsync<string>(token, context);
    try {
      retVal = value?.Evaluating() ?? defaultValue;
    } catch (ex) {
      context.DebugContext.LogError(`Error In Get 'if' Attribute Value`, ex);
      retVal = false;
    }
    return retVal;
  }

  private static async RunTypeConvertorAsync(
    token: IToken<string>,
    context: IContext,
    defaultValue: RunType
  ): Promise<RunType> {
    var tmpVal = await Util.GetValueOrDefaultAsync<string>(token, context);
    return tmpVal !== null ? RunType[tmpVal.toLowerCase()] : defaultValue;
  }

  private static async RenderTypeConvertorAsync(
    token: IToken<string>,
    context: IContext,
    defaultValue: RenderType
  ): Promise<RenderType> {
    var tmpVal = await Util.GetValueOrDefaultAsync<string>(token, context);
    return tmpVal !== null ? RenderType[tmpVal.toLowerCase()] : defaultValue;
  }

  private static async StringConvertorAsync(
    token: IToken<string>,
    context: IContext,
    defaultValue: string
  ) {
    return Util.GetValueOrDefaultAsync(token, context, defaultValue);
  }
  get Name(): Promise<string> {
    return this.GetAttribute<string>(
      "name",
      null,
      RenderingTurnContext.StringConvertorAsync
    );
  }
  get If(): Promise<boolean> {
    return this.GetAttribute<boolean>(
      "if",
      true,
      RenderingTurnContext.BooleanConvertorAsync
    );
  }

  get RunType(): Promise<RunType> {
    return this.GetAttribute<RunType>(
      "run",
      RunType.none,
      RenderingTurnContext.RunTypeConvertorAsync
    );
  }

  get RenderTo(): Promise<string> {
    return this.GetAttribute<string>(
      "renderto",
      null,
      RenderingTurnContext.StringConvertorAsync
    );
  }
  get RenderType(): Promise<RenderType> {
    return this.GetAttribute<RenderType>(
      "rendertype",
      RenderType.none,
      RenderingTurnContext.RenderTypeConvertorAsync
    );
  }
  async GetCanUseRenderToAsync(): Promise<boolean> {
    var retVal = this.Context.RenderToIsValid;
    if (retVal) {
      var renderTo = await this.RenderTo;
      if (renderTo != "*") {
        retVal = false;
      }
    }
    return retVal;
  }

  get Id(): string {
    var retVal = this.lookup.get("id");
    if (retVal === undefined) {
      retVal = this.Element.getAttribute("id");
      this.lookup.set("id", retVal);
    }
    return retVal;
  }
  get Core(): string {
    var retVal = this.lookup.get("core");
    if (retVal === undefined) {
      retVal = this.Element.getAttribute("core");
      this.lookup.set("core", retVal);
    }
    return retVal;
  }

  private async GetAttribute<T>(
    attributeName: string,
    defaultValue: T,
    convertor: (
      token: IToken<string>,
      context: IContext,
      defaultValue: T
    ) => Promise<T>
  ): Promise<T> {
    var retVal = this.lookup.get(attributeName);
    if (retVal === undefined) {
      var token = this.Element.GetStringToken(attributeName);
      retVal = await convertor(token, this.Context, defaultValue);
      this.lookup.set(attributeName, retVal);
    }
    return retVal;
  }

  constructor(element: Element, context: IContext) {
    this.Context = context;
    this.Element = element;
  }
}
