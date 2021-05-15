export default interface IEventManager<T> {
  Trigger(data?: T): void;
  Clear(): void;
}
