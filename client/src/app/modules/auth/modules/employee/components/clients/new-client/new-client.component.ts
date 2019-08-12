import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatStepper, MatSnackBar } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataApiService } from '../../../services/data-api.service';

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
  feeScheduleList = ['None', 'Order', 'Statement'];
  clientFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  private _unsubscribe = new Subject<boolean>();

  constructor(
    private _dialogRef: MatDialogRef<NewClientComponent>,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
   ) { }

  ngOnInit() {
    this._dataApi.find('DeliveryRoute', { fields: { id: true, name: true } })
      .subscribe(result => {
        this.routeList = map(result, function(route) {
          return { id: route.id, name: route.name };
        });
      });
    this.clientFG = this._formBuilder.group({
      formArray: this._formBuilder.array([
        this._formBuilder.group({      // business detail
          name: ['', Validators.required],
          showPublic: false,
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
          feeSchedule: ['', Validators.required],
          feeType: ['', Validators.required],
          feeValue: ['', Validators.required]
        })
      ])
    });
    // For 'None' fee schedule, disable other fee fields
    (<FormArray>this.clientFG.get('formArray')).at(2).get('feeSchedule').valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(value => {
        if (value === 'None') {
          (<FormArray>this.clientFG.get('formArray')).at(2).get('feeType').reset({ value: 'Fixed', disabled: true });
          (<FormArray>this.clientFG.get('formArray')).at(2).get('feeValue').reset({ value: '0.00', disabled: true });
        } else {
          (<FormArray>this.clientFG.get('formArray')).at(2).get('feeType').reset({ value: '', disabled: false });
          (<FormArray>this.clientFG.get('formArray')).at(2).get('feeValue').reset({ value: '0', disabled: false });
        }
      });    
    // (<FormArray>this.clientFG.get('formArray')).at(2).get('feeType').valueChanges
    //   .pipe(takeUntil(this._unsubscribe))
    //   .subscribe(value => {
    //       // fee schedule is only applicable with 'Fixed' fee.
    //     if (value === 'Fixed') {
    //       // set value to null to force user to select a schedule
    //       (<FormArray>this.clientFG.get('formArray')).at(2).get('feeSchedule').setValue('');
    //     } else {
    //       // reset to 'None'
    //       (<FormArray>this.clientFG.get('formArray')).at(2).get('feeSchedule').setValue('None');
    //     }
    //   });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
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

  async create() {
    let newClient = reduce(this.clientFG.get('formArray').value, assign);
    try {
      let client = await this._dataApi.upsert('Client', newClient).toPromise();
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
