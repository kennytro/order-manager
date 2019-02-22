import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewClientComponent } from '../new-client/new-client.component';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { ClientService } from '../../../../shared/services/client.service';
import { Client } from '../../../../../../shared/sdk/models';


@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'name', 'phone', 'deliveryRouteId', 'createdDate'];
  private _clients: MatTableDataSource<Client>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute,
    private _newClientDialog: MatDialog,
    private _clientSvc: ClientService) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['clients']) {
        this._setTableDataSource(routeData['clients']);
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
    const dialogRef = this._newClientDialog.open(NewClientComponent);
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        // refresh list to include the new client
        let clientArray = await this._clientSvc.getClientList();
        this._setTableDataSource(clientArray);
      }
    })    
  }

  private _setTableDataSource(clients: Client[]) {
    this._clients = new MatTableDataSource(clients);
    this._clients.paginator = this.paginator;
    this._clients.sort = this.sort;   
  }
}
