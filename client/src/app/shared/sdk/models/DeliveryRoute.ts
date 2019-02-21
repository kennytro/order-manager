/* tslint:disable */
import {
  Client
} from '../index';

declare var Object: any;
export interface DeliveryRouteInterface {
  "id": string;
  "description"?: string;
  "driverName"?: string;
  "driverPhone"?: string;
  clients?: Client[];
}

export class DeliveryRoute implements DeliveryRouteInterface {
  "id": string;
  "description": string;
  "driverName": string;
  "driverPhone": string;
  clients: Client[];
  constructor(data?: DeliveryRouteInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `DeliveryRoute`.
   */
  public static getModelName() {
    return "DeliveryRoute";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of DeliveryRoute for dynamic purposes.
  **/
  public static factory(data: DeliveryRouteInterface): DeliveryRoute{
    return new DeliveryRoute(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'DeliveryRoute',
      plural: 'DeliveryRoutes',
      path: 'DeliveryRoutes',
      idName: 'id',
      properties: {
        "id": {
          name: 'id',
          type: 'string'
        },
        "description": {
          name: 'description',
          type: 'string'
        },
        "driverName": {
          name: 'driverName',
          type: 'string'
        },
        "driverPhone": {
          name: 'driverPhone',
          type: 'string'
        },
      },
      relations: {
        clients: {
          name: 'clients',
          type: 'Client[]',
          model: 'Client',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'deliveryRouteId'
        },
      }
    }
  }
}
