/* tslint:disable */

declare var Object: any;
export interface CustomerDataInterface {
  "id"?: number;
}

export class CustomerData implements CustomerDataInterface {
  "id": number;
  constructor(data?: CustomerDataInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `CustomerData`.
   */
  public static getModelName() {
    return "CustomerData";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of CustomerData for dynamic purposes.
  **/
  public static factory(data: CustomerDataInterface): CustomerData{
    return new CustomerData(data);
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
      name: 'CustomerData',
      plural: 'CustomerData',
      path: 'CustomerData',
      idName: 'id',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
