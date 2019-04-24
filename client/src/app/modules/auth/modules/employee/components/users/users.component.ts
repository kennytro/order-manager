import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import { NewUserComponent } from '../new-user/new-user.component';
import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'email', 'clientId', 'createdDate'];
  private _users: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute,
    private _newUserDialog: MatDialog,
    private _dataApi: DataApiService) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['users']) {
        this._setTableDataSource(routeData['users']);
      }
    });    
  }

  applyFilter(filterValue: string) {
    this._users.filter = filterValue.trim().toLowerCase();

    if (this._users.paginator) {
      this._users.paginator.firstPage();
    }
  }

  getUsersCount() {
    return this._users.data.length;
  }

  getUsers() {
    return this._users;
  }

  addUser() {
    const dialogRef = this._newUserDialog.open(NewUserComponent);
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        // refresh list to include the new client
        let userArray = await this._dataApi.find('EndUser', {
          fields: { id: true, email: true, clientId: true, createdDate: true }
        }).toPromise();
        this._setTableDataSource(userArray);
      }
    });
  }

  private _setTableDataSource(users: Array<any>) {
    this._users = new MatTableDataSource(users);
    this._users.paginator = this.paginator;
    this._users.sort = this.sort;   
  }
}
