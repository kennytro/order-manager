import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil, filter } from 'rxjs/operators';

import { ConfirmDialogComponent, DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MessageDetailComponent, MessageDialogData } from '../message-detail/message-detail.component';

import { AuthService, UserProfile } from '../../../../../../../services/auth.service';
import { DataApiService } from '../../../services/data-api.service';
import { SocketService } from '../../../../../shared/services/socket.service';

@Component({
  selector: 'app-messages',
  providers: [ SocketService ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  displayedColumns: string[] = ['select', 'type', 'from', 'subject', 'createdAt'];
  private _userId: number;
  messages: MatTableDataSource<Message>;
  selections: SelectionModel<Message>;

  private _unsubscribe = new Subject<boolean>();
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private _messageDialog: MatDialog,
    private _dataApi: DataApiService,
    private _auth: AuthService,
    private _socketService: SocketService
  ) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['messages']) {
        this._setTableDataSource(routeData['messages']);
      }
    });
    this._dataApi.genericMethod('EndUser', 'getMyUser', [this._auth.getUserProfile().authId])
      .subscribe(user => {
        this._userId = user.id;
      });
    this._socketService.initSocket('message');
    this._socketService.onModel('message')
      .pipe(takeUntil(this._unsubscribe), filter((data) => (!data.toUserId || data.toUserId === this._userId)))
      .subscribe((data) => {
        console.log(`Received message (${JSON.stringify(data)})`);
        this._refreshMessages();
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

  messageTypeIcon(mType: string): string {
    switch (mType) {
      case 'Announcement':
        return 'bullhorn';
      case 'Notice':
        return 'exclamation-circle';
      case 'Inquiry':
        return 'question-circle';
      default:
        break;
    }
    return 'envelope';
  }

  newMessage() {
    const dialogData: MessageDialogData = {
      new: true
    };
    const dialogRef = this._messageDialog.open(MessageDetailComponent, {
      data: dialogData
    });
  }

  readMessage(message) {
    const dialogData: MessageDialogData = {
      new: false,
      message: message
    };
    const dialogRef = this._messageDialog.open(MessageDetailComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (!result || result.action === 'read') {
        if (!message.isRead) {      // message was previuosly unread.
          message.isRead = true;
          await this._dataApi.genericMethod('Message', 'markAsRead', [[message.id]]).toPromise();
        }
      }
    });
  }

  // Not implemented, yet.
  // markAsRead() {
  //   console.log('mark selected messages as read');
  // }

  delete() {
    if (this.selections.selected.length == 0) {
      return;
    }
    const dialogData: DialogData = {
      title: 'Delete Message',
      content: 'Do you want to delete the selected message(s)?',
      confirmColor: 'warn',
      confirmIcon: 'trash-alt',
      confirmLabel: 'Delete'
    };
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe( async result => {
      if (result) {
        let msgIds = this.selections.selected.map(msg => msg.id);
        await this._dataApi.genericMethod('Message', 'deleteMessages', [msgIds]).toPromise();
        const snackBarRef = this._snackBar.open(`Deleted ${msgIds.length} message(s)`, 'Close', {
          duration: 3000
        });
        snackBarRef.onAction().subscribe(() => {
          snackBarRef.dismiss();
        });
      }
    });
  }

  private async _refreshMessages() {
      let messages = await this._dataApi.genericMethod('Message', 'getMessages').toPromise();
      this._setTableDataSource(messages);    
  }

  private _setTableDataSource(messages: Array<any>) {
    this.messages = new MatTableDataSource(messages);
    this.messages.sort = this.sort;
    this.selections = new SelectionModel<Message>(true, []);
  }
}
