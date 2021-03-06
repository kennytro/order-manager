import { NgModule } from '@angular/core';

import { AuthSharedModule } from '../../shared/auth-shared.module';
import { SharedModule } from '../../../../shared/shared.module';
import { CustomerRoutingModule } from './customer-routing.module';

// Components
import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';
import { SettingsComponent } from './components/customer-layout/settings/settings.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TotalOrdersComponent } from './components/dashboard/total-orders/total-orders.component';
import { TodaysSnapshotsComponent } from './components/dashboard/todays-snapshots/todays-snapshots.component';
import { OrdersComponent } from './components/orders/orders/orders.component';
import { NewOrderComponent } from './components/orders/new-order/new-order.component';
import { OrderDetailComponent } from './components/orders/order-detail/order-detail.component';
import { StatementsComponent } from './components/statements/statements/statements.component';
import { StatementDetailComponent } from './components/statements/statement-detail/statement-detail.component';
import { MessagesComponent } from './components/messages/messages/messages.component';
import { MessageDetailComponent } from './components/messages/message-detail/message-detail.component';

// Services
import { FileService } from '../../shared/services/file.service';
import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { DataApiService } from './services/data-api.service';
import { OrderResolver } from './services/order.resolver';
// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faBell, faBullhorn,
  faCartPlus, faChartLine, faChevronLeft, faChevronRight, faCog,
  faEnvelope, faExclamationCircle,
  faFileInvoiceDollar, faFilePdf,
  faKey, faLongArrowAltLeft, faLongArrowAltRight, faPlus, faQuestionCircle,
  faSignOutAlt, faShoppingCart, faTrashAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { RankGraphComponent } from './components/dashboard/rank-graph/rank-graph.component';

@NgModule({
  declarations: [CustomerLayoutComponent, SettingsComponent,
    DashboardComponent, TotalOrdersComponent, TodaysSnapshotsComponent,
    OrdersComponent, NewOrderComponent, OrderDetailComponent,
    StatementsComponent, StatementDetailComponent, MessagesComponent, MessageDetailComponent, RankGraphComponent/* ConfirmDialogComponent */ ],
  imports: [
    AuthSharedModule,
    SharedModule,
    CustomerRoutingModule
  ],
  providers: [
    FileService,
    DataResolver,
    DataArrayResolver,  
    DataApiService,
    OrderResolver
  ],
  entryComponents: [
    MessageDetailComponent,
    SettingsComponent
  ]
})
export class CustomerModule {
  constructor() {
    library.add(faBars, faBell, faBullhorn, 
    faCartPlus, faChartLine, faChevronLeft, faChevronRight, faCog, 
    faEnvelope, faExclamationCircle,
    faFileInvoiceDollar, faFilePdf,
    faKey, faLongArrowAltLeft, faLongArrowAltRight, faPlus, faQuestionCircle,
    faSignOutAlt, faShoppingCart, faTrashAlt, faUsers);
  }
}
