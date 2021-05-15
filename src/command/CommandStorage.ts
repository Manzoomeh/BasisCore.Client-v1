import CommandInfo from "./CommandInfo";

export default class CommandStorage {
  private static _current: CommandStorage = new CommandStorage();
  public static get Current(): CommandStorage {
    return CommandStorage._current;
  }
  private storage: WeakMap<Element, CommandInfo> = new WeakMap();
  public Get(element: Element): CommandInfo {
    return this.storage.get(element);
  }
  public Add(element: Element, commandInfo: CommandInfo): void {
    this.storage.set(element, commandInfo);
  }
}
