import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import map from 'lodash/map';

import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  clientList = [];
  userFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  private _unsubscribe = new Subject<boolean>();

  constructor(
    private _dialogRef: MatDialogRef<NewUserComponent>,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    this.userFG = this._formBuilder.group({
      role: 'customer',
      clientId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.userFG.get('role').valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(role => {
        this._updateClientIdFormControl(role);
      });

    this._dataApi.find('Client', { fields: { id: true, name: true } })
      .pipe(take(1))
      .subscribe(result => {
        // this.clientList = map(result, 'id');
        this.clientList = result;
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  async create() {
    try {
      let user = this.userFG.value;
      user.userSettings = {
        roles: [user.role]
      };
      user = await this._dataApi.upsert('EndUser', user).toPromise();
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

  /* Whenever user role changes, 'clientId' validation must change as well.
  */
  private _updateClientIdFormControl(roleSelected) {
    let clientIdFC = this.userFG.get('clientId');
    // clientId is applicable only for 'customer' role.
    if (roleSelected === 'customer') {
      clientIdFC.setValidators([Validators.required]);
      clientIdFC.reset({ value: '', disabled: false });
    } else {
      clientIdFC.setValidators(null);
      clientIdFC.reset({ value: '', disabled: true });
    }
  }
}
