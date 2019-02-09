import { Component, OnInit } from '@angular/core';
import { AWS_S3_PUBLIC_URL } from '../../../../shared/base.url';
import { RootScopeShareService } from '../../../../services/root-scope-share.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css']
})
export class PublicLayoutComponent implements OnInit {
  private _companyLogo: string;
  constructor(private _dataShare: RootScopeShareService) { }

  ngOnInit() {
    const tenant = this._dataShare.getData('tenant');
    this._companyLogo = AWS_S3_PUBLIC_URL + tenant.id + '/favicon.png';
  }

  getCompanyLogo() {
    return this._companyLogo;
  }
}
