import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import get from 'lodash/get';

import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  stateList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  companyInfo: any;
  companyInfoFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(
    private _dialogRef: MatDialogRef<SettingsComponent>,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    // build form group. TODO: add logo selection.
    this.companyInfoFG = this._formBuilder.group({
      name: ['', Validators.required],
      addressStreet: ['', Validators.required],
      addressCity: ['', Validators.required],
      addressState: ['', Validators.required],
      addressZip: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', Validators.required],
      email: ['', Validators.email]
    });

    this._dataApi.genericMethod('CompanyInfo', 'getCompanyInfo')
      .pipe(take(1))
      .subscribe(result => {
        this.companyInfo = result;
        this._loadCompanyInfoToFormControl();
      });
  }

  ngOnDestroy() { }

  getZipErrorMessage() {
    if (this.companyInfoFG.get('addressZip').hasError('required')) {
      return 'Zip code is required.';
    }
    if (this.companyInfoFG.get('addressZip').hasError('minlength')) {
      return 'Zip code must be at least 5 digits.';
    }
    return '';
  }

  async save() {
    try {
      await this._dataApi.genericMethod('CompanyInfo', 'setCompanyInfo', [this.companyInfoFG.value]).toPromise();
      const snackBarRef = this._snackBar.open(`Company Information successfully saved`,
        'Close', { duration: 3000 });
      snackBarRef.onAction()
        .pipe(take(1))
        .subscribe(() => {
          snackBarRef.dismiss();
        });
      this._dialogRef.close(true);
    } catch (err) {
      console.log(`error: failed to save - ${err.message}`);      
    }
  }

  private _loadCompanyInfoToFormControl() {
    this.companyInfoFG.get('name').setValue(get(this.companyInfo, 'name', ''))
    this.companyInfoFG.get('addressStreet').setValue(get(this.companyInfo, 'addressStreet', ''))
    this.companyInfoFG.get('addressCity').setValue(get(this.companyInfo, 'addressCity', ''))
    this.companyInfoFG.get('addressState').setValue(get(this.companyInfo, 'addressState', ''))
    this.companyInfoFG.get('addressZip').setValue(get(this.companyInfo, 'addressZip', ''))
    this.companyInfoFG.get('phone').setValue(get(this.companyInfo, 'phone', ''))
    this.companyInfoFG.get('email').setValue(get(this.companyInfo, 'email', ''))
  }
}
