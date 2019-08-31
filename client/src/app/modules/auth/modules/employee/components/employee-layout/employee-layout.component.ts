import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Subject, timer, of, Observable, Subscription } from 'rxjs';
import { take, takeUntil, catchError } from 'rxjs/operators';

import { SettingsComponent } from './settings/settings.component';
import { ConfirmDialogComponent, DialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { AWS_S3_PUBLIC_URL } from '../../../../../../shared/base.url';
import { AuthService, UserProfile } from '../../../../../../services/auth.service';
import { RootScopeShareService } from '../../../../../../services/root-scope-share.service';

import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-employee-layout',
  templateUrl: './employee-layout.component.html',
  styleUrls: ['./employee-layout.component.css']
})
export class EmployeeLayoutComponent implements OnInit {
  unreadMsgCount: string = '0';      // fa-layer-count [content] is a string.
  private _unreadMsgCountTimerMaxPeriod: number = 60000;
  private _unreadMsgCountTimerPeriod: number;
  private _unreadMsgCountTimerSubscription: Subscription;

  private _companyLogo: string;
  private _companyName: string;
  private _unsubscribe = new Subject<boolean>();  

  constructor(private _auth: AuthService,
    private _dataShare: RootScopeShareService,
    private _settingsDialog: MatDialog,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService) { }

  ngOnInit() {
    const tenant = this._dataShare.getData('tenant');
    this._companyLogo = AWS_S3_PUBLIC_URL + tenant.id + '/favicon.png';   
    this._companyName = tenant.companyName;
    this._unreadMsgCountTimerPeriod = 10000;    // initially 10 seconds.
    this._setTimerForUnreadMessageCount(100, this._unreadMsgCountTimerPeriod);
  }  

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  settings() {
    const diaglogRef = this._settingsDialog.open(SettingsComponent);
  }

  changePassword() {
    if (this._auth.isDemoUser()) {
      const snackBarRef = this._snackBar.open('This service is not available to demo user.', 'Close');
      snackBarRef.onAction()
        .pipe(take(1))
        .subscribe(() => {
          snackBarRef.dismiss();
        });
      return;
    }
    const dialogData: DialogData = {
      title: 'Change Password',
      content: 'We will send an email with a link to change password.',
      confirmColor: 'green',
      confirmIcon: 'key',
      confirmLabel: 'Send Email'
    };
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe( async result => {
      if (result) {
        await this._dataApi.genericMethod('EndUser', 'sendMeResetPasswordEmail', [this._auth.getUserProfile().authId]).toPromise();
        const snackBarRef = this._snackBar.open(`Sent password reset email to ${this.getUserEmail()}`, 'Close', {
          duration: 3000
        });
        snackBarRef.onAction().subscribe(() => {
          snackBarRef.dismiss();
        });
      }
    });
  }

  logout() {
    const dialogData: DialogData = {
      title: 'Are you sure?',
      confirmColor: 'warn',
      confirmIcon: 'sign-out-alt',
      confirmLabel: 'Log out'
    };
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._unreadMsgCountTimerSubscription.unsubscribe();  // cancel timer before logout
        this._auth.logout();
      }
    })
  }

  getCompanyLogo() {
    return this._companyLogo;
  }

  getCompanyName() {
    return this._companyName;
  }

  getUserEmail() {
    return this._auth.getUserProfile().email;
  }
  
  getUserPicture() {
    return this._auth.getUserProfile().pictureUrl;
  }  

  private _setTimerForUnreadMessageCount(initDelay: number, period: number) {
    if (this._unreadMsgCountTimerSubscription) {
      this._unreadMsgCountTimerSubscription.unsubscribe();
    }
    this._unreadMsgCountTimerSubscription = timer(initDelay, period)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(() => {
        this._updateUnreadMessageCount();
      });
  }

  private _updateUnreadMessageCount() {
    this._dataApi.genericMethod('Message', 'countUnread')
      .pipe(take(1), catchError(err => {
        console.error(`Cannot count unread message - ${err}`);
        return of(-1);
      }))
      .subscribe(count => {
        if (count < 0) {
          // server is not healthy. increase update period unto 1 min.
          if (this._unreadMsgCountTimerPeriod < this._unreadMsgCountTimerMaxPeriod) {
            this._unreadMsgCountTimerPeriod += 10000;  // increase update period by 10 sec.
            this._setTimerForUnreadMessageCount(this._unreadMsgCountTimerPeriod, this._unreadMsgCountTimerPeriod);          
          }          
        } else {
          this.unreadMsgCount = count.toString();
          if (this._unreadMsgCountTimerPeriod > 10000) {
            // server is back. reset the period to 10 seconds.
            this._unreadMsgCountTimerPeriod = 10000;
            this._setTimerForUnreadMessageCount(this._unreadMsgCountTimerPeriod, this._unreadMsgCountTimerPeriod);
          }
        }
      });
  }
}
