import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';

import { RoleGuardService } from './services/role-guard.service';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faCog } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    AuthLayoutComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    AuthRoutingModule
  ],
  providers: [
    RoleGuardService
  ]
})
export class AuthModule {
  constructor() {
    library.add(faSignOutAlt, faCog);
  }
}
