/* tslint:disable */
import {
  DeliveryRoute
} from '../index';

declare var Object: any;
export interface ClientInterface {
  "id"?: number;
  "name": string;
  "addressStreet"?: string;
  "addressCity"?: string;
  "addressState"?: string;
  "addressZip"?: string;
  "phone"?: string;
  "email"?: string;
  "contactPersonName"?: string;
  "contactPersonPhone"?: string;
  "contactPersonEmail"?: string;
  "contactPersonAltName"?: string;
  "contactPersonAltPhone"?: string;
  "contactPersonAltEmail"?: string;
  "feeType"?: string;
  "feeValue"?: number;
  "showPublic"?: boolean;
  "deliveryRouteId"?: string;
  "createdDate"?: Date;
  deliveryRoute?: DeliveryRoute;
}

export class Client implements ClientInterface {
  "id": number;
  "name": string;
  "addressStreet": string;
  "addressCity": string;
  "addressState": string;
  "addressZip": string;
  "phone": string;
  "email": string;
  "contactPersonName": string;
  "contactPersonPhone": string;
  "contactPersonEmail": string;
  "contactPersonAltName": string;
  "contactPersonAltPhone": string;
  "contactPersonAltEmail": string;
  "feeType": string;
  "feeValue": number;
  "showPublic": boolean;
  "deliveryRouteId": string;
  "createdDate": Date;
  deliveryRoute: DeliveryRoute;
  constructor(data?: ClientInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Client`.
   */
  public static getModelName() {
    return "Client";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Client for dynamic purposes.
  **/
  public static factory(data: ClientInterface): Client{
    return new Client(data);
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
      name: 'Client',
      plural: 'Clients',
      path: 'Clients',
      idName: 'id',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
        "name": {
          name: 'name',
          type: 'string'
        },
        "addressStreet": {
          name: 'addressStreet',
          type: 'string'
        },
        "addressCity": {
          name: 'addressCity',
          type: 'string'
        },
        "addressState": {
          name: 'addressState',
          type: 'string'
        },
        "addressZip": {
          name: 'addressZip',
          type: 'string'
        },
        "phone": {
          name: 'phone',
          type: 'string'
        },
        "email": {
          name: 'email',
          type: 'string'
        },
        "contactPersonName": {
          name: 'contactPersonName',
          type: 'string'
        },
        "contactPersonPhone": {
          name: 'contactPersonPhone',
          type: 'string'
        },
        "contactPersonEmail": {
          name: 'contactPersonEmail',
          type: 'string'
        },
        "contactPersonAltName": {
          name: 'contactPersonAltName',
          type: 'string'
        },
        "contactPersonAltPhone": {
          name: 'contactPersonAltPhone',
          type: 'string'
        },
        "contactPersonAltEmail": {
          name: 'contactPersonAltEmail',
          type: 'string'
        },
        "feeType": {
          name: 'feeType',
          type: 'string'
        },
        "feeValue": {
          name: 'feeValue',
          type: 'number'
        },
        "showPublic": {
          name: 'showPublic',
          type: 'boolean'
        },
        "deliveryRouteId": {
          name: 'deliveryRouteId',
          type: 'string'
        },
        "createdDate": {
          name: 'createdDate',
          type: 'Date'
        },
      },
      relations: {
        deliveryRoute: {
          name: 'deliveryRoute',
          type: 'DeliveryRoute',
          model: 'DeliveryRoute',
          relationType: 'belongsTo',
                  keyFrom: 'deliveryRouteId',
          keyTo: 'id'
        },
      }
    }
  }
}
