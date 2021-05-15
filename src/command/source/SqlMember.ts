import ConstantData from "../../ConstantData";
import BasisCore from "../../context/BasisCore";
import RenderingTurnContext from "../../context/RenderingTurnContext";
import Util from "../../Util";
import InMemoryMember from "./InMemoryMember";

declare function $bc(): BasisCore;

export default class SqlMember extends InMemoryMember {
  constructor(element: Element) {
    super(element);
  }

  async ParseDataAsync(context: RenderingTurnContext): Promise<ConstantData> {
    var rawContent = this.Element.textContent.ToStringToken();
    var sql = await Util.GetValueOrDefaultAsync(rawContent, context.Context);

    var rawDataMemberNames = this.Element.GetStringToken("datamembername");
    var sources = new Array<string>();
    if (rawDataMemberNames) {
      console.log("rawDataMemberNames", rawDataMemberNames);
      sources = (
        await Util.GetValueOrDefaultAsync(rawDataMemberNames, context.Context)
      ).split(",");
    } else {
      sources = this.GetSqlSources(sql);
    }
    var task = sources.map((source) =>
      context.Context.WaitToGetDataSourceAsync(source)
    );
    var datas = await Promise.all(task);
    var lib = await $bc().GetOrLoadDbLibAsync();
    var db = new lib.Database();
    datas.forEach((data) => {
      db.exec(`CREATE TABLE [${data.Data.Name}]`);
      db.tables[data.Data.Name].data = data.Data.Rows;
    });
    var queryResult = db.exec(sql);
    return new ConstantData("", queryResult);
  }

  GetSqlSources(sql: string): string[] {
    var regexp = RegExp(/\[([^\]]+)\]/g, "g");
    var matches = (<any>sql).matchAll(regexp);
    return Array.from(matches, (m) => m[1]).filter(
      (value, index, array) => array.indexOf(value) === index
    );
  }
}
