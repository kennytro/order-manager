import { NgModule } from '@angular/core';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

import { AuthSharedModule } from '../../shared/auth-shared.module';
import { CustomerRoutingModule } from './customer-routing.module';

// Components
import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/orders/orders.component';
import { NewOrderComponent } from './components/new-order/new-order.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';

// Services
import { FileService } from '../../shared/services/file.service';
import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { DataApiService } from './services/data-api.service';
import { OrderResolver } from './services/order.resolver';
// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faCartPlus, faChartLine, faCog, faExclamationCircle,
  faFileInvoiceDollar, faFilePdf,
  faKey, faLongArrowAltLeft, faLongArrowAltRight, faPlus, faQuestionCircle,
  faSignOutAlt, faShoppingCart, faTrashAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { StatementsComponent } from './components/statements/statements/statements.component';
import { StatementDetailComponent } from './components/statements/statement-detail/statement-detail.component';
import { TotalOrdersComponent } from './components/dashboard/total-orders/total-orders.component';
import { TodaysSnapshotsComponent } from './components/dashboard/todays-snapshots/todays-snapshots.component';

@NgModule({
  declarations: [CustomerLayoutComponent, DashboardComponent, OrdersComponent, NewOrderComponent, OrderDetailComponent, StatementsComponent, StatementDetailComponent, TotalOrdersComponent, TodaysSnapshotsComponent, /* ConfirmDialogComponent */ ],
  imports: [
    AuthSharedModule,
    CustomerRoutingModule,
    Ng2GoogleChartsModule
  ],
  providers: [
    FileService,
    DataResolver,
    DataArrayResolver,  
    DataApiService,
    OrderResolver
  ]
})
export class CustomerModule {
  constructor() {
    library.add(faBars, faCartPlus, faChartLine, faCog, faExclamationCircle,
    faFileInvoiceDollar, faFilePdf,
    faKey, faLongArrowAltLeft, faLongArrowAltRight, faPlus, faQuestionCircle,
    faSignOutAlt, faShoppingCart, faTrashAlt, faUsers);
  }
}
