import BasisCore from "./context/BasisCore";
import IDatabase from "./interface/IDatabase";

declare function $bc(): BasisCore;

export default class LocalDataBase implements IDatabase {
  private readonly _dataBaseName: string;
  private _db;
  private readonly _getSchemas: () => Map<string, any>;
  constructor(databaseName: any, getSchemas: () => Map<string, any>) {
    this._getSchemas = getSchemas;
    this._dataBaseName = databaseName;
  }
  async DropAsync(): Promise<boolean> {
    var affected = await this.ExecuteAsync(
      `DROP localStorage DATABASE ${this._dataBaseName}`
    );
    this._db = null;
    return affected == 1;
  }
  async ExecuteAsync<T>(sql: string, params?: any): Promise<T> {
    if (!this._db) {
      await this.InitializeAsync();
    }
    return await new Promise<T>((resolve) =>
      this._db.exec(sql, params, (x) => resolve(x))
    );
  }
  async ExecuteAsTableAsync(sql: string, params?: any): Promise<any[]> {
    var data = await this.ExecuteAsync<any[]>(sql, params);
    var cols: string[];
    if (data.length > 0) {
      cols = Object.getOwnPropertyNames(data[0]);
    } else {
      cols = [];
    }
    var rows = [];
    data.forEach((row) => rows.push(cols.map((col) => row[col])));
    var retVal = [cols, ...rows];
    return retVal;
  }
  private async InitializeAsync(): Promise<void> {
    if (!this._db) {
      var lib = await $bc().GetOrLoadDbLibAsync();
      var create = lib.exec(
        `CREATE localStorage DATABASE IF NOT EXISTS ${this._dataBaseName}`
      );
      lib.exec(`ATTACH localStorage DATABASE ${this._dataBaseName}`);
      this._db = lib.databases[this._dataBaseName];
      if (create == 1) {
        for (let [tblName, schema] of this._getSchemas().entries()) {
          var tmp = Object.getOwnPropertyNames(schema).map(
            (columnName) => `${columnName} ${schema[columnName]}`
          );
          var cols = tmp.join(",");
          console.log(`CREATE TABLE IF NOT EXISTS ${tblName} (${cols})`);
          await this.ExecuteAsync(
            `CREATE TABLE IF NOT EXISTS ${tblName} (${cols})`
          );
        }
      }
    }
  }
}
