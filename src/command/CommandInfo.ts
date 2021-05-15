import RenderingTurnContext from "../context/RenderingTurnContext";
import EventManager from "../dataset/EventManager";
import { CommandState } from "../enum/CommandState";
import ICommandInfo from "../interface/ICommandInfo";
import CommandBase from "./CommandBase";

export default class CommandInfo implements ICommandInfo {
  readonly Command: CommandBase;
  readonly OnRendering: EventManager<RenderingTurnContext>;
  readonly OnRendered: EventManager<RenderingTurnContext>;
  CurrentContext: RenderingTurnContext;
  State: CommandState;
  constructor(command: CommandBase) {
    this.Command = command;
    this.CurrentContext = null;
    this.OnRendering = new EventManager<RenderingTurnContext>();
    this.State = CommandState.Created;
  }
  async UpdateAsync(): Promise<void> {
    await this.Command.UpdateAsync();
  }
}
