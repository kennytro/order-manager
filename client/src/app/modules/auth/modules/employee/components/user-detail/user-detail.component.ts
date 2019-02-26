import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '../../../../shared/services/alert.service';
import { DataApiService } from '../../services/data-api.service';

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
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService,
    private _alertSvc: AlertService
  ) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['user']) {
        this.user = routeData['user'];
      }
      if (routeData['clients']) {
        this.clientList = map(routeData['clients'], 'id');
      }
      this.userFG = this._formBuilder.group({
        email: [this.user.email, Validators.email],
        clientId: [this.user.clientId, Validators.required]
      })
    });
  }
  async save() {
    try {
      await this._dataApi.upsert('EndUser', assign(this.user, this.userFG.value)).toPromise();
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
