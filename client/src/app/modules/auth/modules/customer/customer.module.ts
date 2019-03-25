import { NgModule } from '@angular/core';

import { AuthSharedModule } from '../../shared/auth-shared.module';
import { CustomerRoutingModule } from './customer-routing.module';

// Components
import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/orders/orders.component';
import { NewOrderComponent } from './components/new-order/new-order.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';

// Services
import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { DataApiService } from './services/data-api.service';
import { OrderResolver } from './services/order.resolver';
// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faCartPlus, faChartLine, faCog, faExclamationCircle, faFileInvoiceDollar,
  faKey, faLongArrowAltLeft, faLongArrowAltRight, faPlus, faQuestionCircle,
  faSignOutAlt, faShoppingCart, faTrashAlt, faUsers } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [CustomerLayoutComponent, DashboardComponent, OrdersComponent, NewOrderComponent, OrderDetailComponent, /* ConfirmDialogComponent */ ],
  imports: [
    AuthSharedModule,
    CustomerRoutingModule
  ],
  providers: [
    DataResolver,
    DataArrayResolver,  
    DataApiService,
    OrderResolver
  ]
})
export class CustomerModule {
  constructor() {
    library.add(faBars, faCartPlus, faChartLine, faCog, faExclamationCircle, faFileInvoiceDollar,
    faKey, faLongArrowAltLeft, faLongArrowAltRight, faPlus, faQuestionCircle,
    faSignOutAlt, faShoppingCart, faTrashAlt, faUsers);
  }
}
