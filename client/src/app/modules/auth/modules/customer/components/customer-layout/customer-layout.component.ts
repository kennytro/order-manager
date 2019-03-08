import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConfirmLogoutComponent } from '../../../../shared/components/confirm-logout/confirm-logout.component';

import { AWS_S3_PUBLIC_URL } from '../../../../../../shared/base.url';
import { AuthService, UserProfile } from '../../../../../../services/auth.service';
import { RootScopeShareService } from '../../../../../../services/root-scope-share.service';

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css']
})
export class CustomerLayoutComponent implements OnInit {
  private _companyLogo: string;
  private _storeName: string;

  constructor(private _auth: AuthService,
    private _dataShare: RootScopeShareService,
    private _logoutDialog: MatDialog) { }

  ngOnInit() {
    const tenant = this._dataShare.getData('tenant');
    this._companyLogo = AWS_S3_PUBLIC_URL + tenant.id + '/favicon.png';   
    this._storeName = "Store Name Here";
  }

  settings() {
    console.log('clicked settings ');
  }

  changePassword() {
    console.log('clicked change password');
  }

  logout() {
    const dialogRef = this._logoutDialog.open(ConfirmLogoutComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._auth.logout();
      }
    })
  }

  getCompanyLogo() {
    return this._companyLogo;
  }

  getStoreName() {
    return this._storeName;
  }

  getUserEmail() {
    return this._auth.getUserProfile().email;
  }
  
  getUserPicture() {
    return this._auth.getUserProfile().pictureUrl;
  }
}
