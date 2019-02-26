/* tslint:disable */

declare var Object: any;
export interface EmployeeDataInterface {
  "id"?: number;
}

export class EmployeeData implements EmployeeDataInterface {
  "id": number;
  constructor(data?: EmployeeDataInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `EmployeeData`.
   */
  public static getModelName() {
    return "EmployeeData";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of EmployeeData for dynamic purposes.
  **/
  public static factory(data: EmployeeDataInterface): EmployeeData{
    return new EmployeeData(data);
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
      name: 'EmployeeData',
      plural: 'EmployeeData',
      path: 'EmployeeData',
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
