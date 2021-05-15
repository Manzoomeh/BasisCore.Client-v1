import RenderingTurnContext from "../context/RenderingTurnContext";
import { CommandState } from "../enum/CommandState";
import { RenderType } from "../enum/RenderType";
import ClientException from "../exception/ClientException";
import ICommand from "../interface/ICommand";
import IContext from "../interface/IContext";
import Util from "../Util";
import CommandInfo from "./CommandInfo";
import CommandStorage from "./CommandStorage";

export default abstract class CommandBase implements ICommand {
  readonly Info: CommandInfo;

  private ActiveProcessAsync: Promise<void>;
  constructor(element: Element) {
    this.Element = element;
    this.Info = new CommandInfo(this);
    CommandStorage.Current.Add(this.Element, this.Info);
  }
  readonly Element: Element;

  async ExecuteAsync(context: IContext): Promise<void> {
    if (this.Info.State == CommandState.Rendering) {
      await this.StopRenderingAsync();
      if (this.ActiveProcessAsync) {
        await this.ActiveProcessAsync;
      }
    }
    var tmpFunc = async () => {
      this.Info.CurrentContext = new RenderingTurnContext(
        this.Element,
        context
      );
      this.Info.OnRendering.Trigger(this.Info.CurrentContext);
      try {
        if (await this.Info.CurrentContext.If) {
          this.Info.State = CommandState.Rendering;
          await this.ExecuteCommandAsync(this.Info.CurrentContext);
          this.Info.State = CommandState.Rendered;
        }
      } catch (ex) {
        await this.ApplyResultAsync(ex, this.Info.CurrentContext, true);
        this.Info.CurrentContext.Context.DebugContext.LogError(
          `Error In Run '${this.Info.CurrentContext.Core ?? "Content"}'`,
          ex
        );
        this.Info.State = CommandState.Error;
      }
      this.Info.CurrentContext = null;
      this.ActiveProcessAsync = null;
    };
    this.ActiveProcessAsync = tmpFunc();
    await this.ActiveProcessAsync;
  }
  protected ExecuteCommandAsync(
    renderingTurn: RenderingTurnContext
  ): Promise<void> {
    throw new Error("'ExecuteCommandAsync' Not Implemented");
  }

  protected async ApplyResultAsync(
    result: string,
    context: RenderingTurnContext,
    replace: boolean
  ): Promise<void> {
    var renderTo = await context.RenderTo;
    if (Util.HasValue(renderTo)) {
      if (renderTo != "*") {
        if (!context.Context.RenderToIsValid) {
          throw new ClientException(
            "'renderto' Attribute  Not Support In This Context."
          );
        }
        var destination = document.querySelectorAll(renderTo);
        var renderType = await context.RenderType;
        if (renderType != RenderType.none) {
          replace = renderType == RenderType.replace;
        }
        if (replace) {
          destination.forEach((x) => {
            this.ReplaceContent(x, result);
          });
        } else {
          destination.forEach((x) => {
            this.AppendContent(x, result);
          });
        }
      }
    } else {
      this.ReplaceElement(this.Element, result);
    }
  }

  private ReplaceElement(container: Element, tagString: string) {
    try {
      var range = document.createRange();
      range.selectNode(container.parentElement);
      var documentFragment = range.createContextualFragment(tagString);
      container.parentElement.replaceChild(documentFragment, container);
    } catch (err) {
      console.error(err);
    }
  }

  private AppendContent(container: Element, tagString: string) {
    try {
      var range = document.createRange();
      range.selectNode(container);
      var documentFragment = range.createContextualFragment(tagString);
      container.appendChild(documentFragment);
    } catch (err) {
      console.error(err);
    }
  }
  private ReplaceContent(container: Element, tagString: string) {
    try {
      var range = document.createRange();
      range.selectNode(container);
      var documentFragment = range.createContextualFragment(tagString);
      container.innerHTML = "";
      container.appendChild(documentFragment);
    } catch (err) {
      console.error(err);
    }
  }

  protected async GetAttributeValueAsync(
    attributeName: string,
    turnContext: RenderingTurnContext,
    defaultValue: string = null
  ): Promise<string> {
    var token = this.Element.GetStringToken(attributeName);
    return (await token?.GetValueAsync(turnContext.Context)) || defaultValue;
  }

  async UpdateAsync(): Promise<void> {
    if (this.Info.State !== CommandState.Rendering) {
      throw new ClientException(
        `Command State '${
          CommandState[this.Info.State]
        }' Is Invalid For Updateing`
      );
    }
    await this.UpdateCommandAsync(this.Info.CurrentContext);
  }

  async UpdateCommandAsync(turnContext: RenderingTurnContext): Promise<void> {
    throw new ClientException(
      `UpdateAsync Not supportred in ${turnContext.Core} command`
    );
  }

  protected async StopRenderingAsync(): Promise<void> {}
}
