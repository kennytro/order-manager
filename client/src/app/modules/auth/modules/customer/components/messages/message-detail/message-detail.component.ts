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

  messageIcon(mType: string): string {
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
