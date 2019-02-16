import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faCog, faChartLine, faShoppingCart, faFileInvoiceDollar, faStoreAlt, faUsers } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [EmployeeLayoutComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    EmployeeRoutingModule
  ]
})
export class EmployeeModule {
  constructor() {
    library.add(faSignOutAlt, faCog, faChartLine, faShoppingCart,
      faFileInvoiceDollar, faStoreAlt, faUsers);
  }
}
