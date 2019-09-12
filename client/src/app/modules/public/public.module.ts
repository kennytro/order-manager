import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
         MatSnackBarModule, MatSortModule, MatTableModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';


import { SharedModule } from '../../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { ClientComponent } from './components/client/client.component';
import { ClientsComponent } from './components/client/clients/clients.component';
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
import { AgmConfig } from './services/agm-config';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMobile, faSignInAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
  declarations: [
  	LoginComponent,
  	PublicHomeComponent,
  	PublicLayoutComponent,
    ClientComponent,
    ClientsComponent,
    ProductComponent,
    ProductsComponent,
    ProcessComponent,
    LoginComponent,
    ContactUsComponent,
    SafePipe
  ],
  imports: [
    MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
    MatSnackBarModule, MatSortModule, MatTableModule,
    ReactiveFormsModule,
    RecaptchaModule, RecaptchaFormsModule,
    SharedModule,
    FlexLayoutModule,
    CommonModule,
    FontAwesomeModule,
    PublicRoutingModule,
    AgmCoreModule.forRoot()
  ],
  providers: [
    LocalScopeShareService,
    ContentService,
    MessageService,
    PublicHomeResolver,
    ClientResolver,
    ProductResolver,
    ProcessResolver,
    {
      provide: LAZY_MAPS_API_CONFIG,
      useClass: AgmConfig
    }    
  ]
})
export class PublicModule {
  constructor() {
    library.add(faMobile, faSignInAlt, faInfoCircle);
  }
}
