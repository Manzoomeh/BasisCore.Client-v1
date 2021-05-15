import ConstantData from "./ConstantData";
import BasisCore from "./context/BasisCore";
import { ConstantDataSource } from "./DataSource";
import IContext from "./interface/IContext";
import IData from "./interface/IData";
import IDataSource from "./interface/IDataSource";
import { IDictionary } from "./interface/IDictionary";
import IToken from "./interface/IToken";
import StreamData from "./StreamData";
import ArrayToken from "./token/base/ArrayToken";
import ObjectToken from "./token/base/ObjectToken";
import ValueToken from "./token/base/ValueToken";
import BooleanArray from "./token/boolean/BooleanArray";
import BooleanObject from "./token/boolean/BooleanObject";
import BooleanValue from "./token/boolean/BooleanValue";
import IntegerArray from "./token/integer/IntegerArray";
import IntegerObject from "./token/integer/IntegerObject";
import IntegerValue from "./token/integer/IntegerValue";
import StringArray from "./token/string/StringArray";
import StringObject from "./token/string/StringObject";
import StringValue from "./token/string/StringValue";

declare function $bc(): BasisCore;

export default class Util {
  static ReplaceEx(
    source: string,
    searchValue: string,
    replaceValue: string
  ): string {
    return source.replace(new RegExp(searchValue, "gi"), replaceValue);
  }

  static async ApplyFilterAsync(source: IData, filter: string): Promise<any[]> {
    var retVal: any[];
    if (Util.IsNullOrEmpty(filter)) {
      retVal = source.Rows;
    } else {
      var lib = await $bc().GetOrLoadDbLibAsync();
      retVal = lib(`SELECT * FROM ? where ${filter}`, [source.Rows]);
    }
    return retVal;
  }

  static ApplySimpleFilter(data: any[], columnName: string, columnValue: any) {
    var retVal: any[];

    if (typeof columnValue === "string" && columnValue.IsEqual("null")) {
      retVal = data.filter((x) => x[columnName] === null);
    } else {
      retVal = data.filter((x) => x[columnName] == columnValue);
    }
    return retVal;
  }
  static async AddToContextAsync(
    datatable: IData,
    context: IContext,
    preview: boolean = false,
    sort: string = null,
    postSql: string = null
  ) {
    var lib: any;
    if (postSql) {
      if (!Util.HasValue(lib)) {
        lib = await $bc().GetOrLoadDbLibAsync();
      }
      datatable.Rows = lib(
        Util.ReplaceEx(postSql, `\\[${datatable.Name}\\]`, "?"),
        [datatable.Rows]
      );
    }
    if (sort) {
      if (!Util.HasValue(lib)) {
        lib = await $bc().GetOrLoadDbLibAsync();
      }
      datatable.Rows = lib(`SELECT * FROM ? order by ${sort}`, [
        datatable.Rows,
      ]);
    }
    Util.AddRowNumber(datatable);
    var source: IDataSource;
    if (datatable instanceof ConstantData) {
      source = new ConstantDataSource(datatable);
      context.AddDataSource(source);
    } else if (datatable instanceof StreamData) {
      source = context.AddOrUpdateDataSource(datatable);
    }
    if (preview || context.DebugContext.InDebugMode) {
      context.AddPreview(source);
    }
  }

  static AddRowNumber(datatable: IData) {
    var index = 1;
    datatable.Rows.forEach((row) => {
      row.rownumber = index++;
    });
    datatable.UpdateColumnList();
  }

  static Equal(a: any, b: any): boolean {
    var retVal: boolean = true;
    if (!Util.HasValue(a) || !Util.HasValue(b)) {
      retVal = false;
    } else {
      var aProps = Object.getOwnPropertyNames(a);
      var bProps = Object.getOwnPropertyNames(b);
      if (aProps.length != bProps.length) {
        retVal = false;
      } else {
        for (var i = 0; i < aProps.length; i++) {
          var propName = aProps[i];
          if (a[propName] !== b[propName]) {
            retVal = false;
            break;
          }
        }
      }
    }
    return retVal;
  }

  static ToData(
    rawTbl: Array<any>,
    tblName,
    setting: any,
    factory: (tblName: string, rows: Array<any>, setting: any) => IData
  ): IData {
    var cols = <string[]>rawTbl.shift();
    //for add case insensitive to alasql lib
    cols = cols?.map((x) => x.toLowerCase().trim()) ?? [];
    var rows = new Array<any>();
    rawTbl.forEach((rawRow) => {
      var row = {};
      cols.forEach((col, index) => {
        row[col] = rawRow[index];
      });
      rows.push(row);
    });
    return factory(tblName, rows, setting);
  }

  static ToDataTable(tblName: string, rawTbl: Array<any>): IData {
    return Util.ToData(
      rawTbl,
      tblName,
      null,
      (name, rows, _) => new ConstantData(name, rows)
    );
  }

  static async GetValueOrDefaultAsync<T>(
    token: IToken<T>,
    context: IContext,
    defaultValue: T = null
  ): Promise<T> {
    return (await token?.GetValueAsync(context)) || defaultValue;
  }

  static async GetAttributeValueAsync(
    element: Element,
    attributeName: string,
    context: IContext,
    defaultValue: string = null
  ): Promise<string> {
    var token = element.GetStringToken(attributeName);
    return (await token?.GetValueAsync(context)) || defaultValue;
  }

  static async GetValueOrSystemDefaultAsync<T>(
    token: IToken<string>,
    context: IContext,
    key: string
  ): Promise<string> {
    var retVal: string;
    if (Util.HasValue(token)) {
      retVal = await token.GetValueAsync(context);
    } else {
      retVal = context.GetDefault(key);
    }
    return retVal;
  }

  static IsEqual(stringA: string, stringB: string): boolean {
    return (stringA || "").IsEqual(stringB);
  }

  static HasValue(data: any): boolean {
    return data !== undefined && data != null;
  }

  static IsNullOrEmpty(data: string): boolean {
    return data === undefined || data == null || data === "";
  }

  static ToStringToken(data: string): IToken<string> {
    return Util.ToToken<string>(
      data,
      (x) => new StringValue(x),
      (x) => new StringObject(x),
      (...x) => new StringArray(...x)
    );
  }
  static ToIntegerToken(data: string): IToken<number> {
    return Util.ToToken<number>(
      data,
      (x) => new IntegerValue(parseInt(x)),
      (x) => new IntegerObject(x),
      (...x) => new IntegerArray(...x)
    );
  }
  static ToBooleanToken(data: string): IToken<boolean> {
    return Util.ToToken<boolean>(
      data,
      (x) => new BooleanValue(Util.IsEqual(x, "true")),
      (x) => new BooleanObject(x),
      (...x) => new BooleanArray(...x)
    );
  }

  static ToToken<T>(
    data: string,
    newValueToken: { (data: string): ValueToken<T> },
    newObjectToken: { (data: string): ObjectToken<T> },
    newArrayToken: { (...data: IToken<string>[]): ArrayToken<T> }
  ): IToken<T> {
    //https://javascript.info/regexp-methods
    var tmp = $bc().GetDefault("binding.regex", "\\[##([^#]*)##\\]");
    var retVal: IToken<T>;
    if (Util.HasValue(data)) {
      var match = data.match(tmp);
      if (!match) {
        retVal = newValueToken(data);
      } else {
        var list = new Array<any>();
        do {
          if (match.index != 0) {
            list.push(newValueToken(match.input.substring(0, match.index)));
          }
          list.push(newObjectToken(match[1]));
          data = data.substring(match.index + match[0].length);
          match = data.match(tmp);
        } while (match);
        if (data.length > 0) {
          list.push(newValueToken(data));
        }
        if (list.length == 1) {
          retVal = list[0];
        } else {
          retVal = newArrayToken(...list);
        }
      }
    }
    return retVal;
  }

  public static FindElementRootCommandNode(
    rootElement: Element
  ): Array<Element> {
    var retVal: Array<Element> = [];
    var prodcess = (child: ChildNode) => {
      if (child instanceof Element && (<Element>child).IsBasisCore()) {
        retVal.push(<any>child);
      } else {
        child.childNodes.forEach(prodcess);
      }
    };
    rootElement.childNodes.forEach(prodcess);
    return retVal;
  }

  public static Ajax(
    url: string,
    methode: string,
    parameters: IDictionary<string> = null
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = false;
      xhr.open(methode, url, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(xhr.statusText);
          }
        }
      };
      xhr.onerror = function (e) {
        reject(xhr.statusText);
      };
      var encodedDataPairs;
      if (Util.HasValue(parameters)) {
        encodedDataPairs = [];
        ///https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX/Getting_Started
        Object.getOwnPropertyNames(parameters).forEach((name, _i, _) =>
          encodedDataPairs.push(
            encodeURIComponent(name) +
              "=" +
              encodeURIComponent(parameters[name])
          )
        );
        encodedDataPairs = encodedDataPairs.join("&").replace(/%20/g, "+");
      }
      xhr.send(encodedDataPairs);
    });
  }
}
