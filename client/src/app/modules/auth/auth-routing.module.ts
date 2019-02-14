import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';

import { RoleGuardService } from './services/role-guard.service';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivateChild: [RoleGuardService],
    children: [
      {
        path: 'customer',
        loadChildren: './modules/customer/customer.module#CustomerModule',
        canLoad: [RoleGuardService]
      },
      {
        path: 'employee',
        loadChildren: './modules/employee/employee.module#EmployeeModule',
        canLoad: [RoleGuardService]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { };

