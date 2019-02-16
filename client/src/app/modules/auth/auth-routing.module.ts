import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoleGuardService } from './services/role-guard.service';

const routes: Routes = [
  {
    path: '',
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

