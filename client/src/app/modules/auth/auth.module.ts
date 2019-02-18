import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';

import { RoleGuardService } from './services/role-guard.service';

// import { ClientDetailComponent } from './shared/components/client-detail/client-detail.component';

@NgModule({
  declarations: [/* ClientDetailComponent */],
  imports: [
    CommonModule,
    AuthRoutingModule
  ],
  providers: [
    RoleGuardService
  ]
})
export class AuthModule { }
