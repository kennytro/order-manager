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
import { NewClientComponent } from './components/new-client/new-client.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';
import { ConfirmLogoutComponent } from '../../shared/components/confirm-logout/confirm-logout.component';
import { UsersComponent } from './components/users/users.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { NewUserComponent } from './components/new-user/new-user.component';

// Services
import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { AlertService } from '../../shared/services/alert.service';
import { DataApiService } from './services/data-api.service';

// Pipes
import { PhoneNumberPipe } from '../../shared/pipes/phone-number.pipe';

// Misc.
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChartLine, faCog, faFileInvoiceDollar,
        faLongArrowAltLeft, faLongArrowAltRight, faPlus, faShoppingCart,
        faSignOutAlt, faStoreAlt, faUser, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    EmployeeLayoutComponent, ClientsComponent, DashboardComponent, ClientDetailComponent,
    ConfirmLogoutComponent, PhoneNumberPipe, NewClientComponent, UsersComponent, UserDetailComponent, NewUserComponent
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
    DataResolver,
    DataArrayResolver,
    AlertService,
    DataApiService
  ],
  entryComponents: [
    ConfirmLogoutComponent,
    NewClientComponent,
    NewUserComponent
  ]
})
export class EmployeeModule {
  constructor() {
    library.add(faChartLine, faCog, faFileInvoiceDollar,
      faLongArrowAltLeft, faLongArrowAltRight, faPlus, faShoppingCart,
      faSignOutAlt, faStoreAlt, faUser, faUserPlus, faUsers);
  }
}
