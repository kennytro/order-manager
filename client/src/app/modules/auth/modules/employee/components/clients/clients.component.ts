import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { Client } from '../../../../../../shared/sdk/models';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'phone', 'deliveryRouteId', 'createdDate'];
  private _clients: MatTableDataSource<Client>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['clients']) {
        this._clients = new MatTableDataSource(routeData['clients']);
        this._clients.paginator = this.paginator;
        this._clients.sort = this.sort;
      }
    });
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
    console.log('clicked new client');
  }
}
