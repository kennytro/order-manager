import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { ClientComponent } from './components/client/client.component';
import { ProductComponent } from './components/product/product.component';
import { ProcessComponent } from './components/process/process.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

@NgModule({
  declarations: [
  	LoginComponent,
  	PublicHomeComponent,
  	PublicLayoutComponent,
    ClientComponent,
    ProductComponent,
    ProcessComponent,
    LoginComponent,
    ContactUsComponent  	
  ],
  imports: [
    CommonModule,
    PublicRoutingModule
  ]
})
export class PublicModule { }
