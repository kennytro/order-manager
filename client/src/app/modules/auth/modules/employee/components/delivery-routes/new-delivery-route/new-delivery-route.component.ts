import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-new-delivery-route',
  templateUrl: './new-delivery-route.component.html',
  styleUrls: ['./new-delivery-route.component.css']
})
export class NewDeliveryRouteComponent implements OnInit {
  deliveryRouteFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(
    private _dialogRef: MatDialogRef<NewDeliveryRouteComponent>,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    this.deliveryRouteFG = this._formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      driverName: [''],
      driverPhone: ['']
    });
  }

  async create() {
    try {
      let deliveryRoute = await this._dataApi.upsert('DeliveryRoute', this.deliveryRouteFG.value).toPromise();
      const snackBarRef = this._snackBar.open(`Delivery Route(id: ${deliveryRoute.id}) successfully created`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._dialogRef.close(true);
    } catch (err) {
      console.log(`error: failed to create a Delivery Route(id: ${this.deliveryRouteFG.value.name}) - ${err.message}`);
    }
  }
}
