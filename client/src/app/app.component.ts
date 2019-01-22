import { Component } from '@angular/core';

import { BASE_URL, API_VERSION } from './shared/base.url';
import { LoopBackConfig } from './shared/sdk/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Order Manager';
  constructor() {
  	LoopBackConfig.setBaseURL(BASE_URL);
  	LoopBackConfig.setApiVersion(API_VERSION);
  }
}
