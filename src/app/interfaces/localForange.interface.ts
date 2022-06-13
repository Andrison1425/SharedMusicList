/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ILocalForage {
  INDEXEDDB: string;
  LOCALSTORAGE: string;
  WEBSQL: string;
  dropInstance: (options: { name?: string; storeName?: string }) => Promise<void>;
  getItem: (q: string) => Promise<any>;
  clear: () => Promise<any>;
  key: (key: number) => Promise<any>
  iterate: (callBack: (value: any, key: any, iterationNumber: number) => any) => Promise<any>;
  keys: () => Promise<any>;
  length: () => Promise<any>;
  removeItem: (q: string) => Promise<any>;
  setItem: (key: string, value: any) => Promise<any>;
  _config: {
    description: string;
    driver: string | [];
    name: string;
    size: number;
    storeName: string;
    version: number
  }
  dbInfo: any
  defaultConfig: {
    description: string;
    driver: string | [];
    name: string;
    size: number;
    storeName: string;
    version: number
  };
  driver: string;
  ready: () => Promise<any>;
  createInstance: (options: {
    name: string;
    storeName: string;
    description?: string
  }) => any
}
