import { NgModule } from '@angular/core';

import { AuthSharedModule } from '../../shared/auth-shared.module';
import { CustomerRoutingModule } from './customer-routing.module';

// Components
import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Services
import { DataApiService } from './services/data-api.service';

// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faChartLine, faCog, faFileInvoiceDollar, faKey,
  faSignOutAlt, faShoppingCart, faUsers } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [CustomerLayoutComponent, DashboardComponent, /* ConfirmDialogComponent */ ],
  imports: [
    AuthSharedModule,
    CustomerRoutingModule
  ],
  providers: [
    DataApiService
  ]
})
export class CustomerModule {
  constructor() {
    library.add(faBars, faChartLine, faCog, faFileInvoiceDollar, faKey,
  faSignOutAlt, faShoppingCart, faUsers);
  }
}
