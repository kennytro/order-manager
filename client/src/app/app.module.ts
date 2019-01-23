import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SDKBrowserModule } from './shared/sdk/index';
import { HomeComponent } from './components/home/home.component';
import { ClientComponent } from './components/client/client.component';
import { ProductComponent } from './components/product/product.component';
import { ProcessComponent } from './components/process/process.component';
import { LoginComponent } from './components/login/login.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ClientComponent,
    ProductComponent,
    ProcessComponent,
    LoginComponent,
    ContactUsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SDKBrowserModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
