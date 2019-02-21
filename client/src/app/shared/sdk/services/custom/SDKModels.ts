/* tslint:disable */
import { Injectable } from '@angular/core';
import { Client } from '../../models/Client';
import { DeliveryRoute } from '../../models/DeliveryRoute';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    Client: Client,
    DeliveryRoute: DeliveryRoute,
    
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
