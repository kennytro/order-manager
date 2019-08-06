import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NewDeliveryRouteComponent } from '../new-delivery-route/new-delivery-route.component';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-delivery-routes',
  templateUrl: './delivery-routes.component.html',
  styleUrls: ['./delivery-routes.component.css']
})
export class DeliveryRoutesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description', 'driverName', 'driverPhone'];
  selection: SelectionModel<any>;
  deliveryRouteSelected: any;

  private _deliveryRoutes: MatTableDataSource<any>;
  private _unsubscribe = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute,
    private _newDeliveryRouteDialog: MatDialog,
    private _dataApi: DataApiService) {
    this.selection = new SelectionModel(false, []);
    this.selection.onChange
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((a) => {
        if (a.added[0]) {
          this.selectDeliveryRoute(a.added[0]);
        }
      });
  }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['routes']) {
        this._setTableDataSource(routeData['routes']);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
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
        let deliveryRouteArray = await this._dataApi.find('DeliveryRoute').toPromise();
        this._setTableDataSource(deliveryRouteArray);
      }
    })
  }

  selectDeliveryRoute(row) {
    this.deliveryRouteSelected = row;
  }

  private _setTableDataSource(routes: Array<any>) {
    this._deliveryRoutes = new MatTableDataSource(routes);
    this._deliveryRoutes.paginator = this.paginator;
    this._deliveryRoutes.sort = this.sort;   
  }
}
