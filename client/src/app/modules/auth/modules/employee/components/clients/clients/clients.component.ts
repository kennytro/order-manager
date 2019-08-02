import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NewClientComponent } from '../new-client/new-client.component';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'name', 'phone', 'deliveryRouteId', 'createdDate'];
  selection: SelectionModel<any>;
  clientSelected: any;
  private _clients: MatTableDataSource<any>;
  private _unsubscribe = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute,
    private _newClientDialog: MatDialog,
    private _dataApi: DataApiService) {
      this.selection = new SelectionModel(false, []);
      this.selection.onChange
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((a) => {
          if (a.added[0]) {
            this.selectClient(a.added[0]);
          }
        });
    }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['clients']) {
        this._setTableDataSource(routeData['clients']);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this._clients.filter = filterValue.trim().toLowerCase();

    if (this._clients.paginator) {
      this._clients.paginator.firstPage();
    }
  }

  getClientsCount() {
    return this._clients.data.length;
  }

  getClients() {
    return this._clients;
  }

  addClient() {
    const dialogRef = this._newClientDialog.open(NewClientComponent);
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        // refresh list to include the new client
        let clientArray = await this._dataApi.find('Client', {
          fields: { id: true, name: true, phone: true, deliveryRouteId: true, createdDate: true },
          include : {
            relation: 'deliveryRoute',
            scope: { fields: { id: true, name: true } }
          }
        }).toPromise();
        this._setTableDataSource(clientArray);
      }
    })
  }

  selectClient(row) {
    this.clientSelected = row;
  }

  private _setTableDataSource(clients: Array<any>) {
    this._clients = new MatTableDataSource(clients);
    this._clients.paginator = this.paginator;
    this._clients.sort = this.sort;   
  }
}
