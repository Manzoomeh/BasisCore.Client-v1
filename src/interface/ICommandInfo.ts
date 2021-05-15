import RenderingTurnContext from "../context/RenderingTurnContext";
import { CommandState } from "../enum/CommandState";

export default interface ICommandInfo {
  CurrentContext: RenderingTurnContext;
  UpdateAsync(): Promise<void>;
  State: CommandState;
}
