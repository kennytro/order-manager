import { Component, OnInit } from '@angular/core';

import { AWS_S3_PUBLIC_URL } from '../../../../../../shared/base.url';
import { AuthService } from '../../../../../../services/auth.service';
import { RootScopeShareService } from '../../../../../../services/root-scope-share.service';

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css']
})
export class CustomerLayoutComponent implements OnInit {
  private _companyLogo: string;
  private _storeName: string;
  constructor(public auth: AuthService,
    private _dataShare: RootScopeShareService) { }

  ngOnInit() {
    const tenant = this._dataShare.getData('tenant');
    this._companyLogo = AWS_S3_PUBLIC_URL + tenant.id + '/favicon.png';   
    this._storeName = "Store Name Here";
  }

  logout() {
    // TODO: confirm with user before logout.
    this.auth.logout();
  }

  getCompanyLogo() {
    return this._companyLogo;
  }

  getStoreName() {
    return this._storeName;
  }
}
