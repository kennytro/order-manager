import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '../../../../../shared/services/alert.service';
import { DataApiService } from '../../../services/data-api.service';

import assign from 'lodash/assign';

@Component({
  selector: 'app-delivery-route-detail',
  templateUrl: './delivery-route-detail.component.html',
  styleUrls: ['./delivery-route-detail.component.css']
})
export class DeliveryRouteDetailComponent implements OnInit {
  deliveryRoute: any;
  deliveryRouteFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

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
      if (routeData['route']) {
        this.deliveryRoute = routeData['route'];
      }
      this.deliveryRouteFG = this._formBuilder.group({
        id: [this.deliveryRoute.id, Validators.required],
        description: [this.deliveryRoute.description],
        driverName: [this.deliveryRoute.driverName],
        driverPhone: [this.deliveryRoute.driverPhone]
      })
    });
  }
  async save() {
    try {
      await this._dataApi.upsert('DeliveryRoute', assign(this.deliveryRoute, this.deliveryRouteFG.value)).toPromise();
      const snackBarRef = this._snackBar.open(`Delivery Route(id: ${this.deliveryRoute.id}) successfully saved`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    } catch (err) {
      const snackBarRef = this._snackBar.open(`Delivery Route(id: ${this.deliveryRoute.id}) could not be saved - ${err.message}`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    }
  }

  async delete() {
    this._alertSvc.confirm('Are you sure?', 'Deleting this delivery route cannot be undone', async () => {
      await this._dataApi.destroyById('DeliveryRoute', this.deliveryRoute.id.toString()).toPromise();
      this._alertSvc.alertSuccess('Success', `Successfully deleted delivery route(id: ${this.deliveryRoute.id})`, () => {
        this._router.navigate(['../'], { relativeTo: this._route });
      });
    });
  }
}
