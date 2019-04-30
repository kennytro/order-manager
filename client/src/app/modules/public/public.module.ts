import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';

import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { ClientComponent } from './components/client/client.component';
import { ProductComponent } from './components/product/product.component';
import { ProcessComponent } from './components/process/process.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

import { LocalScopeShareService } from './services/local-scope-share.service';
import { ContentService } from './services/content.service';
import { PublicHomeResolver } from './services/public-home.resolver';
import { ClientResolver } from './services/client.resolver';
import { ProductResolver } from './services/product.resolver';
import { ProcessResolver } from './services/process.resolver';
import { ContactUsResolver } from './services/contact-us.resolver';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMobile, faSignInAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
  declarations: [
  	LoginComponent,
  	PublicHomeComponent,
  	PublicLayoutComponent,
    ClientComponent,
    ProductComponent,
    ProcessComponent,
    LoginComponent,
    ContactUsComponent,
    SafePipe  	
  ],
  imports: [
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule,
    ReactiveFormsModule,
    TextMaskModule,
    CommonModule,
    FontAwesomeModule,
    PublicRoutingModule
  ],
  providers: [
    LocalScopeShareService,
    ContentService,
    PublicHomeResolver,
    ClientResolver,
    ProductResolver,
    ProcessResolver,
    ContactUsResolver
  ]
})
export class PublicModule {
  constructor() {
    library.add(faMobile, faSignInAlt, faInfoCircle);
  }
}
