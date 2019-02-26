import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataApiService } from '../../services/data-api.service';

import map from 'lodash/map';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  clientList = [];
  userFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(private _dialogRef: MatDialogRef<NewUserComponent>,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService) { }

  ngOnInit() {
    this._dataApi.find('Client', { fields: { id: true } })
      .subscribe(result => {
        this.clientList = map(result, 'id');
      });
    this.userFG = this._formBuilder.group({
      email: ['', Validators.email],
      clientId: ['', Validators.required]
    });
  }

  async create() {
    try {
      let user = await this._dataApi.upsert('EndUser', this.userFG.value).toPromise();
      const snackBarRef = this._snackBar.open(`User(id: ${user.id}) successfully created`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._dialogRef.close(true);
    } catch (err) {
      console.log(`error: failed to create a user(email: ${this.userFG.value.email}) - ${err.message}`);
    }
  }
}
