import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RootScopeShareService {
  private _dataSet: any = {};   

  constructor() {}

  setData(key: any, val: any) {
    this._dataSet[key] = val;
  }
  getData(key: any) {
    return this._dataSet[key];
  }
  removeData(key: any) {
    delete this._dataSet[key];
  }
}
