import IContext from "./IContext";

export default interface IToken<T> {
  GetValueAsync(context: IContext): Promise<T>;
}
