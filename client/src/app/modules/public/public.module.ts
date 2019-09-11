import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
         MatSnackBarModule, MatSortModule, MatTableModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from '../../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { ClientComponent } from './components/client/client.component';
import { ProductComponent } from './components/product/product.component';
import { ProductsComponent } from './components/product/products/products.component';
import { ProcessComponent } from './components/process/process.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

import { LocalScopeShareService } from './services/local-scope-share.service';
import { ContentService } from './services/content.service';
import { MessageService } from './services/message.service';
import { PublicHomeResolver } from './services/public-home.resolver';
import { ClientResolver } from './services/client.resolver';
import { ProductResolver } from './services/product.resolver';
import { ProcessResolver } from './services/process.resolver';

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
    ProductsComponent,
    ProcessComponent,
    LoginComponent,
    ContactUsComponent,
    SafePipe
  ],
  imports: [
    MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
    MatSnackBarModule, MatSortModule, MatTableModule,
    ReactiveFormsModule,
    RecaptchaModule, RecaptchaFormsModule,
    SharedModule,
    FlexLayoutModule,
    CommonModule,
    FontAwesomeModule,
    PublicRoutingModule
  ],
  providers: [
    LocalScopeShareService,
    ContentService,
    MessageService,
    PublicHomeResolver,
    ClientResolver,
    ProductResolver,
    ProcessResolver
  ]
})
export class PublicModule {
  constructor() {
    library.add(faMobile, faSignInAlt, faInfoCircle);
  }
}
