import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import { NewDeliveryRouteComponent } from '../new-delivery-route/new-delivery-route.component';
import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-delivery-routes',
  templateUrl: './delivery-routes.component.html',
  styleUrls: ['./delivery-routes.component.css']
})
export class DeliveryRoutesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'description', 'driverName', 'driverPhone'];
  private _deliveryRoutes: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute,
    private _newDeliveryRouteDialog: MatDialog,
    private _dataApi: DataApiService) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['routes']) {
        this._setTableDataSource(routeData['routes']);
      }
    });
  }

  applyFilter(filterValue: string) {
    this._deliveryRoutes.filter = filterValue.trim().toLowerCase();

    if (this._deliveryRoutes.paginator) {
      this._deliveryRoutes.paginator.firstPage();
    }
  }

  getDeliveryRoutesCount() {
    return this._deliveryRoutes.data.length;
  }

  getDeliveryRoutes() {
    return this._deliveryRoutes;
  }

  addDeliveryRoute() {
    const dialogRef = this._newDeliveryRouteDialog.open(NewDeliveryRouteComponent);
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        // refresh list to include the new client
        let deliveryRouteArray = await this._dataApi.find('DeliveryRoute', {
          fields: { id: true, driverName: true, driverPhone: true }
        }).toPromise();
        this._setTableDataSource(deliveryRouteArray);
      }
    })
  }

  private _setTableDataSource(routes: Array<any>) {
    this._deliveryRoutes = new MatTableDataSource(routes);
    this._deliveryRoutes.paginator = this.paginator;
    this._deliveryRoutes.sort = this.sort;   
  }
}
