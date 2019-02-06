import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { ClientComponent } from './components/client/client.component';
import { ProductComponent } from './components/product/product.component';
import { ProcessComponent } from './components/process/process.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMobile, faSignInAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

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
    FontAwesomeModule,
    PublicRoutingModule
  ]
})
export class PublicModule {
  constructor() {
    library.add(faMobile, faSignInAlt, faInfoCircle);
  }
}
