import IContext from "../../interface/IContext";
import IToken from "../../interface/IToken";
import Util from "../../Util";
import SimpleTokenElement from "./SimpleTokenElement";

export default abstract class ObjectToken<T> implements IToken<T> {
  constructor(rawValue: string) {
    this.Params = rawValue.split("|").map((part) => {
      var parts = part.toLowerCase().split(".");
      var retVal = new SimpleTokenElement();
      retVal.Column = parts.length > 2 ? parts.slice(2).join(".") : null;
      retVal.Source = parts[0];
      retVal.Member = parts[1];
      return retVal;
    });
  }
  async GetValueAsync(context: IContext): Promise<T> {
    var retVal: T;
    for (var i = 0; i < this.Params.length; i++) {
      var item = this.Params[i];
      var isLastItem = i + 1 == this.Params.length;
      if (item.Source.startsWith("(")) {
        retVal = this.TryParse(item.Source.substr(1, item.Source.length - 2));
      } else {
        if (Util.HasValue(item.Member)) {
          var dataMember = `${item.Source}.${item.Member}`;
          var dataSource = context.TryGetDataSource(dataMember);
          if (Util.HasValue(item.Column)) {
            if (dataSource == null) {
              if (isLastItem) {
                if (dataMember.startsWith("cms.")) {
                  break;
                }
                dataSource = await context.WaitToGetDataSourceAsync(dataMember);
              } else {
                continue;
              }
            }
            var columnName = item.Column.toLowerCase();
            if (dataSource.Data.Columns.indexOf(columnName) == -1) {
              if (isLastItem) {
                break;
              } else {
                continue;
              }
            }
            if (dataSource.Data.Rows.length == 1) {
              var columnRawValue = dataSource.Data.Rows[0][columnName];
              var columnValue = "";
              try {
                columnValue = columnRawValue.toString();
              } catch {
                /*Nothing*/
              }
              if (!Util.HasValue(columnRawValue) || columnValue === "") {
                //if value in source is null or blank,process next source
                if (!isLastItem) {
                  continue;
                }
              } else {
                retVal = this.TryParse(columnValue);
                break;
              }
            } else if (dataSource.Data.Rows.length > 1) {
              try {
                var sb = "";
                var data = dataSource.Data.Rows.filter((x) =>
                  Util.HasValue(x[columnName])
                ).map((x) => x[columnName]);
                data.forEach((item) => {
                  if (sb.length > 0) {
                    sb += ",";
                  }
                  sb += item;
                });
                retVal = this.TryParse(sb);
                break;
              } catch {
                /*Nothing*/
              }
            }
          } else {
            var result = Util.HasValue(dataSource);
            retVal = this.TryParse(result.toString());
          }
        } else {
          var result = await context.CheckSourceHeartbeatAsync(item.Source);
          retVal = this.TryParse(result.toString());
        }
      }
    }
    return retVal;
  }
  Params: Array<SimpleTokenElement>;
  abstract TryParse(value: string): T;
}
