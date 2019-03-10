/* tslint:disable */
import { Injectable } from '@angular/core';
import { EmployeeData } from '../../models/EmployeeData';
import { CustomerData } from '../../models/CustomerData';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    EmployeeData: EmployeeData,
    CustomerData: CustomerData,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
