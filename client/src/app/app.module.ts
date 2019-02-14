import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { SDKBrowserModule } from './shared/sdk/index';
import { PublicModule } from './modules/public/public.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

import { AppInitService } from './services/app-init.service';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { RootScopeShareService } from './services/root-scope-share.service';

export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => { 
    return appInitService.init();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    PublicModule,
    SDKBrowserModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    AppInitService,
    AuthService,
    AuthGuardService,
    RootScopeShareService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
