import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientsComponent } from './components/clients/clients.component';
import { ClientDetailComponent } from '../../shared/components/client-detail/client-detail.component';

import { ClientsResolver } from './services/clients.resolver';

const routes: Routes = [
  {
    path: '',
    component: EmployeeLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'clients',
        children: [
          {
            path: ':id',
            component: ClientDetailComponent
          },
          {
            path: '',
            component: ClientsComponent, resolve: { clients: ClientsResolver }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { };
