export default interface IEvent<T> {
  Add(handler: { (data?: T): void }): void;
  Remove(handler: { (data?: T): void }): void;
}
