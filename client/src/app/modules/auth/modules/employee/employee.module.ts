// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CustomMaterialModule } from '../../../../shared/custom-material.module';
import { SharedModule } from '../../../../shared/shared.module';
import { EmployeeRoutingModule } from './employee-routing.module';

// Components
import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
import { ClientsComponent } from './components/clients/clients.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientDetailComponent } from '../../shared/components/client-detail/client-detail.component';
import { ConfirmLogoutComponent } from '../../shared/components/confirm-logout/confirm-logout.component';
// Services
import { ClientsResolver } from './services/clients.resolver';
import { ClientDetailResolver } from '../../shared/services/client-detail.resolver';
import { DeliveryRoutesResolver } from './services/delivery-routes.resolver';
import { ClientService } from '../../shared/services/client.service';

// Pipes
import { PhoneNumberPipe } from '../../shared/pipes/phone-number.pipe';

// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faCog, faChartLine, faShoppingCart, faFileInvoiceDollar, faStoreAlt,
         faUsers, faPlus, faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    EmployeeLayoutComponent, ClientsComponent, DashboardComponent,
    ClientDetailComponent, ConfirmLogoutComponent, PhoneNumberPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    CustomMaterialModule,
    SharedModule,
    EmployeeRoutingModule
  ],
  providers: [
    ClientsResolver,
    ClientDetailResolver,
    DeliveryRoutesResolver,
    ClientService
  ],
  entryComponents: [
    ConfirmLogoutComponent
  ]
})
export class EmployeeModule {
  constructor() {
    library.add(faSignOutAlt, faCog, faChartLine, faShoppingCart,
      faFileInvoiceDollar, faStoreAlt, faUsers, faPlus, faLongArrowAltLeft);
  }
}
