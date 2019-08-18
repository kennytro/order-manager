import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { MessageDetailComponent, DialogData } from '../message-detail/message-detail.component';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  displayedColumns: string[] = ['select', 'type', 'from', 'subject', 'createdAt'];
  messages: MatTableDataSource<Message>;
  selections: SelectionModel<Message>;

  private _unsubscribe = new Subject<boolean>();
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _messageDialog: MatDialog,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['messages']) {
        this._setTableDataSource(routeData['messages']);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this.messages.filter = filterValue.trim().toLowerCase();

    if (this.messages.paginator) {
      this.messages.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selections.selected.length;
    const numRows = this.messages.data.length;
    return numSelected == numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selections.clear() :
      this.messages.data.forEach(row => this.selections.select(row));
  }

  newMessage() {
    const dialogData: DialogData = {
      new: true
    }
    const dialogRef = this._messageDialog.open(MessageDetailComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        // refresh list to include the new client
        let messages = await this._dataApi.genericMethod('Message', 'getMessages').toPromise();
        this._setTableDataSource(messages);
      }
    })
  }

  readMessage(message) {
    const dialogData: DialogData = {
      new: false
    }
    const dialogRef = this._messageDialog.open(MessageDetailComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (!message.read) {
        message.read = true;
        await this._dataApi.genericMethod('Message', 'markAsRead', [[message.id]]).toPromise();
      }
    });
  }

  markAsRead() {
    console.log('mark selected messages as read');
  }

  delete() {
    console.log('delete selected messages');
  }

  private _setTableDataSource(messages: Array<any>) {
    this.messages = new MatTableDataSource(messages);
    this.messages.sort = this.sort;
    this.selections = new SelectionModel<Message>(true, []);
  }
}
