import IContext from "./IContext";

export default interface ICommand {
  ExecuteAsync(context: IContext): Promise<void>;
}
