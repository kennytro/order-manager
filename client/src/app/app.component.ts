import { Component, Inject, OnInit } from '@angular/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BASE_URL, API_VERSION, AWS_S3_PUBLIC_URL } from './shared/base.url';
import { LoopBackConfig } from './shared/sdk/index';
import { RootScopeShareService } from './services/root-scope-share.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  _title = 'Order Manager';
  loadingRouteConfig: boolean;
  private _unsubscribe = new Subject<boolean>();

  constructor(private _router: Router, 
    private _dataShare: RootScopeShareService) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);

    // change favicon to tenant specific logo.
    const tenantSetting = this._dataShare.getData('tenant');
    document.getElementById('appFavicon').setAttribute('href', AWS_S3_PUBLIC_URL + tenantSetting.id + '/favicon.png');
  }

  ngOnInit() {
    this._router.events
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(event => {
        if (event instanceof RouteConfigLoadStart) {
            this.loadingRouteConfig = true;
        } else if (event instanceof RouteConfigLoadEnd) {
            this.loadingRouteConfig = false;
        }
    });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }
}
