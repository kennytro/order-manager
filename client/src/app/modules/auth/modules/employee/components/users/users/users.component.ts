import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { NewUserComponent } from '../new-user/new-user.component';
import { AuthService } from '../../../../../../../services/auth.service';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'email', 'role', 'clientId', 'createdDate'];
  private _users: MatTableDataSource<any>;
  selection: SelectionModel<any>;
  userSelected: any;
  private _unsubscribe = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute,
    private _newUserDialog: MatDialog,
    private _dataApi: DataApiService,
    private _auth: AuthService,
    private _snackBar: MatSnackBar
  ) {
    this.selection = new SelectionModel(false, []);
    this.selection.onChange
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((a) => {
        if (a.added[0]) {
          this.selectUser(a.added[0]);
        }
      });
   }

  ngOnInit() {
    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
      if (routeData['users']) {
        this._setTableDataSource(routeData['users']);
      }
    });    
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  selectUser(row) {
    this.userSelected = row;
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
    if (this._auth.isDemoUser()) {
      const snackBarRef = this._snackBar.open('This service is not available to demo user.', 'Close');
      snackBarRef.onAction()
        .pipe(take(1))
        .subscribe(() => {
          snackBarRef.dismiss();
        });
      return;
    }
    const dialogRef = this._newUserDialog.open(NewUserComponent);
    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe(async result => {
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
