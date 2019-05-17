import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '../../../../../shared/services/alert.service';
import { DataApiService } from '../../../services/data-api.service';
import { AuthService } from '../../../../../../../services/auth.service';

import assign from 'lodash/assign';
import map from 'lodash/map';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  clientList = [];
  user: any;
  userFG: FormGroup;
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _auth: AuthService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService,
    private _alertSvc: AlertService
  ) { }

  ngOnInit() {
    this.userFG = this._formBuilder.group({
      email: ['', Validators.email],
      clientId: ['']
    })

    this._route.data.subscribe(routeData => {
      if (routeData['user']) {
        this.user = routeData['user'];
        this.userFG.get('email').setValue(this.user.email);
        // update client Id field based on user role.
        let clientIdFC = this.userFG.get('clientId');
        if (this.user.role === 'customer') {
          clientIdFC.setValue(this.user.clientId);
          clientIdFC.setValidators([Validators.required]);
        } else {
          clientIdFC.reset({ value: '', disabled: true });
        }
      }
      if (routeData['clients']) {
        this.clientList = routeData['clients'];
      }
    });
  }

  isCurrentUser() {
    return this.user && this.user.authId === this._auth.getUserProfile().authId;
  }

  async save() {
    try {
      await this._dataApi.genericMethod('EndUser', 'updateUser',
        [assign(this.user, this.userFG.value)]).toPromise();
      const snackBarRef = this._snackBar.open(`User(id: ${this.user.id}) successfully saved`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    } catch (err) {
      const snackBarRef = this._snackBar.open(`User(id: ${this.user.id}) could not be saved - ${err.message}`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    }
  }

  async delete() {
    this._alertSvc.confirm('Are you sure?', 'Deleting this user cannot be undone', async () => {
      await this._dataApi.destroyById('EndUser', this.user.id.toString()).toPromise();
      this._alertSvc.alertSuccess('Success', `Successfully deleted user(id: ${this.user.id})`, () => {
        this._router.navigate(['../'], { relativeTo: this._route });
      });
    });
  }
}
