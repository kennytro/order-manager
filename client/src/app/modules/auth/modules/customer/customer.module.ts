import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faCog, faChartLine, faShoppingCart, faFileInvoiceDollar, faUsers } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [CustomerLayoutComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,    
    CustomerRoutingModule
  ]
})
export class CustomerModule {
  constructor() {
    library.add(faSignOutAlt, faCog, faChartLine, faShoppingCart,
      faFileInvoiceDollar, faUsers);
  }
}
