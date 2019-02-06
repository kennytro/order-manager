import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { SDKBrowserModule } from './shared/sdk/index';
import { PublicModule } from './modules/public/public.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { RootScopeShareService } from './services/root-scope-share.service';

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
    AuthService,
    AuthGuardService,
    RootScopeShareService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
