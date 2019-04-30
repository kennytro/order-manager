import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { SettingsComponent } from '../settings/settings.component';
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
  private _companyLogo: string;
  private _companyName: string;
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
  }

  settings() {
    const diaglogRef = this._settingsDialog.open(SettingsComponent);
  }

  changePassword() {
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
}
