import RenderingTurnContext from "../../context/RenderingTurnContext";
import IData from "../../interface/IData";
import { IDictionary } from "../../interface/IDictionary";
import IToken from "../../interface/IToken";
import Util from "../../Util";

export default abstract class Member {
  Name: string;
  Preview: IToken<boolean>;
  Sort: IToken<string>;
  PostSql: IToken<string>;
  ExtraAttributes: IDictionary<IToken<string>>;
  RawContent: IToken<string>;
  Element: Element;
  constructor(element: Element) {
    this.Element = element;
    this.Name = element.getAttribute("name");
    this.Preview = element.GetBooleanToken("preview");
    this.Sort = element.GetStringToken("sort");
    this.PostSql = element.GetStringToken("postsql");
    this.RawContent = element.textContent.ToStringToken();
  }
  public async AddDataSourceAsync(
    source: IData,
    turnContext: RenderingTurnContext
  ) {
    var postSqlTask = Util.GetValueOrDefaultAsync(
      this.PostSql,
      turnContext.Context,
      null
    );
    var sortTask = Util.GetValueOrDefaultAsync(
      this.Sort,
      turnContext.Context,
      null
    );
    var previewTask = Util.GetValueOrDefaultAsync(
      this.Preview,
      turnContext.Context,
      false
    );
    source.Name = `${await turnContext.Name}.${this.Name}`.toLowerCase();
    Util.AddToContextAsync(
      source,
      turnContext.Context,
      await previewTask,
      await sortTask,
      await postSqlTask
    );
  }
}
