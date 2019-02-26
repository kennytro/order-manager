import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';

import { RoleGuardService } from './services/role-guard.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthRoutingModule
  ],
  providers: [
    RoleGuardService
  ]
})
export class AuthModule { }
