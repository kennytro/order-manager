import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
// import { Router } from '@angular/router';
// import { CookieService } from 'ngx-cookie-service';
import { ConfirmLogoutComponent } from '../../../../shared/components/confirm-logout/confirm-logout.component';

import { AWS_S3_PUBLIC_URL } from '../../../../../../shared/base.url';
import { AuthService } from '../../../../../../services/auth.service';
import { RootScopeShareService } from '../../../../../../services/root-scope-share.service';

@Component({
  selector: 'app-employee-layout',
  templateUrl: './employee-layout.component.html',
  styleUrls: ['./employee-layout.component.css']
})
export class EmployeeLayoutComponent implements OnInit {
  private _companyLogo: string;
  private _companyName: string;
  constructor(public auth: AuthService,
    private _dataShare: RootScopeShareService,
    private _logoutDialog: MatDialog
    /*,
    private _router: Router,
    private _cookieService: CookieService*/) { }

  ngOnInit() {
    const tenant = this._dataShare.getData('tenant');
    this._companyLogo = AWS_S3_PUBLIC_URL + tenant.id + '/favicon.png';   
    this._companyName = tenant.companyName;
    // const roles = this._cookieService.check('roles') ? JSON.parse(this._cookieService.get('roles')) : [];
    // if (roles.includes('customer')) {
    //   this._router.navigate(['auth/customer']);
    // }
    // if (roles.includes('manager') || roles.includes('admin')) {
    //   this._router.navigate(['auth/employee']);
    // }
  }

  logout() {
    const dialogRef = this._logoutDialog.open(ConfirmLogoutComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.auth.logout();
      }
    })
  }

  getCompanyLogo() {
    return this._companyLogo;
  }

  getCompanyName() {
    return this._companyName;
  }
}
