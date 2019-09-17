import { Component, OnInit } from '@angular/core';

import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  client: any;
  constructor(private _dataApi: DataApiService) { }

  ngOnInit() {
    this._dataApi.genericMethod('Client', 'getMyClient')
      .subscribe(result => {
        this.client = result;
      });
  }

}
