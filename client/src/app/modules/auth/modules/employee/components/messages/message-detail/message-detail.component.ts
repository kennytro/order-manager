import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA,
         DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as moment from 'moment';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { ConfirmDialogComponent, DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataApiService } from '../../../services/data-api.service';

export interface MessageDialogData {
  new: boolean,
  message?: any
}

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.css']
})
export class MessageDetailComponent implements OnInit {
  audienceList = ['Everyone', 'Customers', 'Employees'];
  messageTypeList = ['Announcement', 'Notice'];
  composeFG: FormGroup;
  editor = ClassicEditor;
  editorConfig = {
    toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|', 'undo', 'redo' ]
  };
  editorData: string = '';

  private _unsubscribe = new Subject<boolean>();
  todayDate:Date = new Date();
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData,
    private _dialogRef: MatDialogRef<MessageDetailComponent>,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    if (this.data.new) {
      this.composeFG = this._formBuilder.group({
        messageType: ['', Validators.required],
        toUser: ['', Validators.required],
        subject: ['', Validators.required],
//        body: ['', Validators.required],
        hasExpirationDate: false,
        expiresAt: [{ value: moment(), disabled: true }]
      });
      this.composeFG.get('hasExpirationDate').valueChanges
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(value => {
          let currentDate = this.composeFG.get('expiresAt').value;
          this.composeFG.get('expiresAt').reset({ value: currentDate, disabled: !value });
        });
    }
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  messageTitle(): string {
    if (this.data.new) {
      return 'New Message';
    }
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

  closeButtonLabel(): string{
    return this.data.new ? 'Cancel' : 'Close';
  }

  close() {
    if (this.data.new) {
      this._dialogRef.close({ action: 'cancelled'});
    } else {
      this._dialogRef.close({ action: 'read' });
    }
  }

  async save() {
    if (this.data.new) {
      let newMessage = this.composeFG.value;
      let userGroup = newMessage.toUser.toLowerCase();
      // remove properties that we don't save
      delete newMessage.toUser;
      if (!newMessage.hasExpirationDate) {
        delete newMessage.expiresAt;
      }
      delete newMessage.hasExpirationDate;
      newMessage['body'] = this.editorData;
      try {
        let deliveryRoute = await this._dataApi.genericMethod('Message', 'createNewGroupMessage', [userGroup, newMessage]).toPromise();
        const snackBarRef = this._snackBar.open('Message successfully saved',
          'Close', { duration: 3000 });
        snackBarRef.onAction().subscribe(() => {
          snackBarRef.dismiss();
        });
        this._dialogRef.close({ action: 'saved' });
      } catch (err) {
        console.log(`error: failed to create a message - ${err.message}`);
      }
    }
  }

  async delete() {
    if (!this.data.new && this.data.message.id) {
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
}
