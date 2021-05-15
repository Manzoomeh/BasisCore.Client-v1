import IEvent from "../interface/IEvent";
import IEventManager from "../interface/IEventManager";

export default class EventManager<T> implements IEvent<T>, IEventManager<T> {
  private handlers: { (data?: T): void }[] = [];

  public Add(handler: { (data?: T): void }): void {
    this.handlers.push(handler);
  }

  public Remove(handler: { (data?: T): void }): void {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  public Trigger(data?: T) {
    this.handlers.forEach((h) => h(data));
  }

  Clear(): void {
    this.handlers = [];
  }
}
