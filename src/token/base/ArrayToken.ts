import IContext from "../../interface/IContext";
import IToken from "../../interface/IToken";

export default abstract class ArrayToken<T>
  extends Array<IToken<string>>
  implements IToken<T>
{
  constructor(...data: Array<IToken<string>>) {
    super(...data);
  }
  async GetValueAsync(context: IContext): Promise<T> {
    var tasks = new Array<Promise<string>>();
    this.forEach((token) => tasks.push(token.GetValueAsync(context)));
    var result = await Promise.all(tasks);
    var retVal = this.TryParse(result.join(""));
    return retVal;
  }
  abstract TryParse(value: string): T;
}
