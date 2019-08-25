import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { ConfirmDialogComponent, DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataApiService } from '../../../services/data-api.service';

export interface MessageDialogData {
  message: any
}

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.css']
})
export class MessageDetailComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData,
    private _dialogRef: MatDialogRef<MessageDetailComponent>,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService    
  ) { }

  ngOnInit() {
  }

  messageTitle(): string {
    if (this.data.message.messageType) {
      return this.data.message.messageType;
    }
    return 'Message';
  }

  messageIcon(): string {
    let icon = 'envelope';    // default
    if (this.data.message) {
      switch (this.data.message.messageType) {
        case 'Announcement':
          icon = 'bullhorn';
          break;
        case 'Notice':
          icon = 'exclamation-circle';
          break;
        case 'Inquiry':
          icon = 'question-circle';
          break;
        default:
          break;
      }
    }
    return icon;
  }

  close() {
    this._dialogRef.close({ action: 'read' });
  }

  async delete() {
    const dialogData: DialogData = {
      title: 'Delete Message',
      content: 'Do you want to delete this message?',
      confirmColor: 'warn',
      confirmIcon: 'trash-alt',
      confirmLabel: 'Delete'
    };
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe( async result => {
      if (result) {
        await this._dataApi.genericMethod('Message', 'deleteMessages', [[this.data.message.id]]).toPromise();
        const snackBarRef = this._snackBar.open(`Deleted message`, 'Close', {
          duration: 3000
        });
        snackBarRef.onAction().subscribe(() => {
          snackBarRef.dismiss();
        });
        this._dialogRef.close({ action: 'deleted' });
      }
    });
  }
}
