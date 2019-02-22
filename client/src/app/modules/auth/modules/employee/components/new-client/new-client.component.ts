import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatStepper, MatSnackBar } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { BASE_URL, API_VERSION } from '../../../../../../shared/base.url';
import { LoopBackConfig } from '../../../../../../shared/sdk/index';
import { DeliveryRoute } from '../../../../../../shared/sdk/models';
import { ClientApi, DeliveryRouteApi } from '../../../../../../shared/sdk/services';

import reduce from 'lodash/reduce';
import assign from 'lodash/assign';
import map from 'lodash/map';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.component.html',
  styleUrls: ['./new-client.component.css']
})
export class NewClientComponent implements OnInit {
  stateList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  routeList = [];
  feeTypeList = ['Fixed', 'Rate'];      // TO DO: replace with real data  
  clientFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(private _dialogRef: MatDialogRef<NewClientComponent>,
    private _formBuilder: FormBuilder,
    private _clientApi: ClientApi,
    private _deliveryRouteApi: DeliveryRouteApi,
    private _snackBar: MatSnackBar) { 
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);
  }

  ngOnInit() {
    // let routeArray = await this._deliveryRouteApi.find<DeliveryRoute>({
    //   fields: { id: true }
    // }).toPromise();
    // this.routeList = map(routeArray, 'id');
    this._deliveryRouteApi.find<DeliveryRoute>({ fields: { id: true }})
    .subscribe(result => {
      this.routeList = map(result, 'id');
    });
    this.clientFG = this._formBuilder.group({
      formArray: this._formBuilder.array([
        this._formBuilder.group({      // business detail
          name: ['', Validators.required],
          addressStreet: [''],
          addressCity: [''],
          addressState: [''],
          addressZip: ['', Validators.minLength(5)],
          phone: [''],
          email: ['', Validators.email]
        }),
        this._formBuilder.group({    // contact
          contactPersonName: [''],
          contactPersonPhone: [''],
          contactPersonEmail: ['', Validators.email],
          contactPersonAltName: [''],
          contactPersonAltPhone: [''],
          contactPersonAltEmail: ['',Validators.email]
        }),
        this._formBuilder.group({
          deliveryRouteId: ['', Validators.required],
          feeType: ['', Validators.required],
          feeValue: ['', Validators.required]
        })
      ])
    })
  }

  /** Returns a FormArray with the name 'formArray'. */
  get businessFormGroup() : AbstractControl | null {
    return (<FormArray>this.clientFG.get('formArray')).at(0);
  }
  get contactFormGroup() : AbstractControl | null {
    return (<FormArray>this.clientFG.get('formArray')).at(1);
  }
  get orderFormGroup(): AbstractControl | null {
    return (<FormArray>this.clientFG.get('formArray')).at(2);
  }

  isReadyToSave(stepper: MatStepper): boolean {
    return stepper.selectedIndex === 2 && this.orderFormGroup.get('feeTypeFC').value;
  }

  async create() {
    console.log('clicked save.');
    console.log(this.clientFG.get('formArray').value);
    let newClient = reduce(this.clientFG.get('formArray').value, assign);
    try {
      let client = await this._clientApi.create(newClient).toPromise();
      const snackBarRef = this._snackBar.open(`Client(id: ${client.id}) successfully created`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._dialogRef.close(true);
    } catch (err) {
      console.log(`error: failed to create a client(name: ${newClient.name}) - ${err.message}`);
    }
  }
}
