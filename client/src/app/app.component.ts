import { Component, Inject } from '@angular/core';
import { BASE_URL, API_VERSION, AWS_S3_PUBLIC_URL } from './shared/base.url';
import { LoopBackConfig } from './shared/sdk/index';
import { RootScopeShareService } from './services/root-scope-share.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  _title = 'Order Manager';

  constructor(private _dataShare: RootScopeShareService) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);

    // change favicon to tenant specific logo.
    const tenantSetting = this._dataShare.getData('tenant');
    document.getElementById('appFavicon').setAttribute('href', AWS_S3_PUBLIC_URL + tenantSetting.id + '/favicon.png');
  }
}
