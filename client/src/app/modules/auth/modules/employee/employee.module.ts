// Modules
import { NgModule } from '@angular/core';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';

import { AuthSharedModule } from '../../shared/auth-shared.module';
import { SharedModule } from '../../../../shared/shared.module';
import { EmployeeRoutingModule } from './employee-routing.module';

// Components
import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
import { SettingsComponent } from './components/employee-layout/settings/settings.component';
import { ClientsComponent } from './components/clients/clients/clients.component';
import { NewClientComponent } from './components/clients/new-client/new-client.component';
import { ClientDetailComponent } from './components/clients/client-detail/client-detail.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TodaysSnapshotsComponent } from './components/dashboard/todays-snapshots/todays-snapshots.component';
import { TotalOrdersComponent } from './components/dashboard/total-orders/total-orders.component';
import { UsersComponent } from './components/users/users/users.component';
import { UserLogsComponent } from './components/users/users/user-logs/user-logs.component';
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { NewUserComponent } from './components/users/new-user/new-user.component';
import { DeliveryRoutesComponent } from './components/delivery-routes/delivery-routes/delivery-routes.component';
import { DeliveryRouteDetailComponent } from './components/delivery-routes/delivery-route-detail/delivery-route-detail.component';
import { NewDeliveryRouteComponent } from './components/delivery-routes/new-delivery-route/new-delivery-route.component';
import { ProductsComponent } from './components/products/products/products.component';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';
import { NewProductComponent } from './components/products/new-product/new-product.component';
import { OrderLayoutComponent } from './components/orders/order-layout/order-layout.component';
import { TodaysOrdersComponent } from './components/orders/todays-orders/todays-orders.component';
import { OpenOrdersComponent } from './components/orders/open-orders/open-orders.component';
import { ShoppingListComponent } from './components/orders/open-orders/shopping-list/shopping-list.component';
import { PackageDistributionComponent } from './components/orders/open-orders/package-distribution/package-distribution.component';
import { ClosedOrdersComponent } from './components/orders/closed-orders/closed-orders.component';
import { OrderDetailComponent } from './components/orders/order-detail/order-detail.component';
import { NewOrderComponent } from './components/orders/new-order/new-order.component';
import { StatementsComponent } from './components/statements/statements/statements.component';
import { NewStatementComponent } from './components/statements/new-statement/new-statement.component';
import { EditAdjustComponent } from './components/statements/edit-adjust/edit-adjust.component';
import { StatementDetailComponent } from './components/statements/statement-detail/statement-detail.component';
import { HistoryGraphComponent } from './components/charts/history-graph/history-graph.component';
import { RankGraphComponent } from './components/charts/rank-graph/rank-graph.component';
import { MessagesComponent } from './components/messages/messages/messages.component';
import { MessageDetailComponent } from './components/messages/message-detail/message-detail.component';

// Services
import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { StatementResolver } from './services/statement.resolver';
import { OrderResolver } from './services/order.resolver';
import { OrdersResolver } from './services/orders.resolver';
import { StatementsResolver } from './services/statements.resolver';
import { ClientsResolver } from './services/clients.resolver';
import { PdfService } from './services/pdf.service';

import { AlertService } from '../../shared/services/alert.service';
import { FileService } from '../../shared/services/file.service';
import { DataApiService } from './services/data-api.service';
import { ProductService } from './services/product.service';
import { AgmConfig } from './services/agm-config';

// Pipes
import { PhoneNumberPipe } from '../../shared/pipes/phone-number.pipe';

// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowAltCircleDown, faArrowAltCircleUp, faArrowsAltV, faBell, faBullhorn,
        faCaretDown, faCaretUp, faCartPlus, faChartLine, faCheckCircle, faChevronLeft, faChevronRight, faCog,
        faEdit, faEnvelope, faEnvelopeOpen, faExclamationCircle,
        faFileAlt, faFileInvoice, faFileInvoiceDollar, faFilePdf, faFolderOpen, faKey,
        faLongArrowAltLeft, faLongArrowAltRight, faMapMarkedAlt, faPlus, faQuestionCircle,
        faSearchDollar, faShoppingCart, faSignOutAlt, faStoreAlt,
        faTag, faTags, faTimesCircle, faTrashAlt, faTruck, faTruckLoading,
        faUndoAlt, faUser, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { RouteMapComponent } from './components/delivery-routes/delivery-routes/route-map/route-map.component';

@NgModule({
  declarations: [
    EmployeeLayoutComponent, SettingsComponent,
    DashboardComponent, TodaysSnapshotsComponent, TotalOrdersComponent,
    ClientsComponent, ClientDetailComponent, NewClientComponent,
    UsersComponent, UserDetailComponent, NewUserComponent,
    DeliveryRoutesComponent, DeliveryRouteDetailComponent, NewDeliveryRouteComponent,
    ProductsComponent, ProductDetailComponent, NewProductComponent,
    OrderLayoutComponent, TodaysOrdersComponent,
    OpenOrdersComponent, ShoppingListComponent, PackageDistributionComponent,
    ClosedOrdersComponent, OrderDetailComponent, NewOrderComponent,
    StatementsComponent, NewStatementComponent, EditAdjustComponent, StatementDetailComponent,
    PhoneNumberPipe,
    HistoryGraphComponent,
    RankGraphComponent,
    MessagesComponent,
    MessageDetailComponent,
    UserLogsComponent,
    RouteMapComponent
  ],
  imports: [
    AuthSharedModule,
    ImageCropperModule,
    CKEditorModule,
    SharedModule,
    EmployeeRoutingModule,
    AgmCoreModule.forRoot()
  ],
  providers: [
    DataResolver,
    DataArrayResolver,
    OrderResolver,
    OrdersResolver,
    StatementResolver,
    StatementsResolver,
    ClientsResolver,
    AlertService,
    FileService,
    DataApiService,
    ProductService,
    PdfService,
     {
       provide: LAZY_MAPS_API_CONFIG,
       useClass: AgmConfig
     }
  ],
  entryComponents: [
    EditAdjustComponent,
    MessageDetailComponent,    
    NewClientComponent,
    NewDeliveryRouteComponent,
    NewProductComponent,
    NewUserComponent,
    SettingsComponent
  ]
})
export class EmployeeModule {
  constructor() {
    library.add(faArrowAltCircleDown, faArrowAltCircleUp, faArrowsAltV, faBell, faBullhorn,
      faCaretDown, faCaretUp, faCartPlus, faChartLine, faCheckCircle, faChevronLeft, faChevronRight, faCog,
      faEdit, faEnvelope, faEnvelopeOpen, faExclamationCircle,
      faFileAlt, faFileInvoice, faFileInvoiceDollar, faFilePdf, faFolderOpen, faKey,
      faLongArrowAltLeft, faLongArrowAltRight, faMapMarkedAlt, faPlus, faQuestionCircle,
      faSearchDollar, faShoppingCart, faSignOutAlt, faStoreAlt,
      faTag, faTags, faTimesCircle, faTrashAlt, faTruck, faTruckLoading,
      faUndoAlt, faUser, faUserPlus, faUsers);
  }
}
