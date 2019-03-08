// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ImageCropperModule } from 'ngx-image-cropper';

import { CustomMaterialModule } from '../../../../shared/custom-material.module';
import { SharedModule } from '../../../../shared/shared.module';
import { EmployeeRoutingModule } from './employee-routing.module';

// Components
import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
import { ClientsComponent } from './components/clients/clients.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewClientComponent } from './components/new-client/new-client.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';
import { UsersComponent } from './components/users/users.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { NewUserComponent } from './components/new-user/new-user.component';
import { DeliveryRoutesComponent } from './components/delivery-routes/delivery-routes.component';
import { DeliveryRouteDetailComponent } from './components/delivery-route-detail/delivery-route-detail.component';
import { NewDeliveryRouteComponent } from './components/new-delivery-route/new-delivery-route.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { NewProductComponent } from './components/new-product/new-product.component';
import { ConfirmLogoutComponent } from '../../shared/components/confirm-logout/confirm-logout.component';

// Services
import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { AlertService } from '../../shared/services/alert.service';
import { DataApiService } from './services/data-api.service';
import { ProductService } from './services/product.service';

// Pipes
import { PhoneNumberPipe } from '../../shared/pipes/phone-number.pipe';

// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowsAltV, faChartLine, faCog, faFileInvoiceDollar, faFolderOpen,
        faLongArrowAltLeft, faLongArrowAltRight, faPlus, faShoppingCart,
        faSignOutAlt, faStoreAlt, faTag, faTags, faTruck,
        faUndoAlt, faUser, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    EmployeeLayoutComponent, DashboardComponent, ConfirmLogoutComponent,
    ClientsComponent, ClientDetailComponent, NewClientComponent,
    PhoneNumberPipe,
    UsersComponent, UserDetailComponent, NewUserComponent,
    DeliveryRoutesComponent, DeliveryRouteDetailComponent, NewDeliveryRouteComponent, ProductsComponent, ProductDetailComponent, NewProductComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    CustomMaterialModule,
    ImageCropperModule,
    SharedModule,
    EmployeeRoutingModule
  ],
  providers: [
    DataResolver,
    DataArrayResolver,
    AlertService,
    DataApiService,
    ProductService
  ],
  entryComponents: [
    ConfirmLogoutComponent,
    NewClientComponent,
    NewUserComponent,
    NewDeliveryRouteComponent,
    NewProductComponent
  ]
})
export class EmployeeModule {
  constructor() {
    library.add(faArrowsAltV, faChartLine, faCog, faFileInvoiceDollar, faFolderOpen,
      faLongArrowAltLeft, faLongArrowAltRight, faPlus, faShoppingCart,
      faSignOutAlt, faStoreAlt, faTruck, faTag, faTags,
      faUndoAlt, faUser, faUserPlus, faUsers);
  }
}
