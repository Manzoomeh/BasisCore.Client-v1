export default interface IDatabase {
  ExecuteAsync<T>(sql: string, params?: any): Promise<T>;
  ExecuteAsTableAsync(sql: string, params?: any): Promise<any[]>;
  DropAsync(): Promise<boolean>;
}
