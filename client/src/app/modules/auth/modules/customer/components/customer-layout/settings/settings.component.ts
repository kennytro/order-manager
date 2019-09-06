import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { DataApiService } from '../../../services/data-api.service';

export interface SettingsData {
  client: any
};

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
  clientFG: FormGroup;
  private _client: any;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(
    private _dataApi: DataApiService,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SettingsData) {
    this._client = data.client;
   }

  ngOnInit() {
    this.clientFG = this._formBuilder.group({
      name: [this._client.name, Validators.required],
      showPublic: [this._client.showPublic],
      addressStreet: [this._client.addressStreet],
      addressCity: [this._client.addressCity],
      addressState: [this._client.addressState],
      addressZip: [this._client.addressZip],
      phone: [this._client.phone],
      email: [this._client.email, Validators.email],
      contactPersonName: [this._client.contactPersonName],
      contactPersonPhone: [this._client.contactPersonPhone],
      contactPersonEmail: [this._client.contactPersonEmail, Validators.email],
      contactPersonAltName: [this._client.contactPersonAltName],
      contactPersonAltPhone: [this._client.contactPersonAltPhone],
      contactPersonAltEmail: [this._client.contactPersonAltEmail, Validators.email]
    })
  }

  ngOnDestroy() { }

  save() {
    let newClient = Object.assign(this._client, this.clientFG.value);
    this._dataApi.genericMethod('Client', 'setMyClient', [newClient])
      .subscribe((client) => {
        this._snackBar.open('Business information successfully saved', 'Close', { duration: 200 });
        this._dialogRef.close({ client: newClient });
      });
  }
}
