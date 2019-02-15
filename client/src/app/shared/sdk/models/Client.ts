/* tslint:disable */

declare var Object: any;
export interface ClientInterface {
  "id"?: number;
  "name": string;
  "addressStreet"?: string;
  "addressCity"?: string;
  "addressState"?: string;
  "addressZip"?: string;
}

export class Client implements ClientInterface {
  "id": number;
  "name": string;
  "addressStreet": string;
  "addressCity": string;
  "addressState": string;
  "addressZip": string;
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
      },
      relations: {
      }
    }
  }
}
