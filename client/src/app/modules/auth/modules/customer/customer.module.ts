import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CustomMaterialModule } from '../../../../shared/custom-material.module';
import { CustomerRoutingModule } from './customer-routing.module';
import { ConfirmLogoutComponent } from '../../shared/components/confirm-logout/confirm-logout.component';

// Components
import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Services

// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faChartLine, faCog, faFileInvoiceDollar, faKey,
  faSignOutAlt, faShoppingCart, faUsers } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [CustomerLayoutComponent, DashboardComponent, ConfirmLogoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    CustomMaterialModule,
    CustomerRoutingModule
  ],
  entryComponents: [
    ConfirmLogoutComponent
  ]
})
export class CustomerModule {
  constructor() {
    library.add(faBars, faChartLine, faCog, faFileInvoiceDollar, faKey,
  faSignOutAlt, faShoppingCart, faUsers);
  }
}
