import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

import { Client } from '../../../../../shared/sdk/models';
import { ClientService } from '../../services/client.service';

import map from 'lodash/map';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {
  stateList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  routeList = [];
  feeTypeList = ['Fixed', 'Rate'];      // TO DO: replace with real data
  client: Client;
  businessEmailFC = new FormControl('', [Validators.email]);
  personEmailFC = new FormControl('', [Validators.email]);
  personAltEmailFC = new FormControl('', [Validators.email]);
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(
    private _route: ActivatedRoute,
    private _clientService: ClientService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['client']) {
        this.client = routeData['client'];
        this.businessEmailFC.setValue(this.client.email);
        this.personEmailFC.setValue(this.client.contactPersonEmail);
        this.personAltEmailFC.setValue(this.client.contactPersonAltEmail);
      }
      if (routeData['deliveryRoutes']) {
        this.routeList = map(routeData['deliveryRoutes'], 'id');
      }
    });
  }

  async save() {
    console.log('clicked save client');
    try {
      // preprocess values
      this.client.email = this.businessEmailFC.value;
      this.client.contactPersonEmail = this.personEmailFC.value;
      this.client.contactPersonAltEmail = this.personAltEmailFC.value;
      await this._clientService.save(this.client);
      const snackBarRef = this._snackBar.open(`Client(id: ${this.client.id}) successfully saved`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    } catch (err) {
      const snackBarRef = this._snackBar.open(`Client(id: ${this.client.id}) could not be saved - ${err.message}`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    }
  }
}
