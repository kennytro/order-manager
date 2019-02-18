// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CustomMaterialModule } from '../../../../shared/custom-material.module';
import { EmployeeRoutingModule } from './employee-routing.module';

// Components
import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
import { ClientsComponent } from './components/clients/clients.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientDetailComponent } from '../../shared/components/client-detail/client-detail.component';

// Services
import { ClientsResolver } from './services/clients.resolver';

// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faCog, faChartLine, faShoppingCart, faFileInvoiceDollar, faStoreAlt,
         faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [EmployeeLayoutComponent, ClientsComponent, DashboardComponent, ClientDetailComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    CustomMaterialModule,
    EmployeeRoutingModule
  ],
  providers: [
    ClientsResolver
  ]
})
export class EmployeeModule {
  constructor() {
    library.add(faSignOutAlt, faCog, faChartLine, faShoppingCart,
      faFileInvoiceDollar, faStoreAlt, faUsers, faPlus);
  }
}
