import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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
    private _dialogRef: MatDialogRef<MessageDetailComponent>
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
}
