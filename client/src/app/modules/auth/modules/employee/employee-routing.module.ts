import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientsComponent } from './components/clients/clients.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component'; 
import { UsersComponent } from './components/users/users.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';

import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
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
            component: ClientDetailComponent,
            resolve: {
              client: DataResolver,
              deliveryRoutes: DataArrayResolver
            },
            data: {
              modelName: 'Client',
              arrayModelName: 'DeliveryRoute'
            }
          },
          {
            path: '',
            component: ClientsComponent,
            resolve: { clients: DataArrayResolver },
            data: { arrayModelName: 'Client' }
          }
        ]
      },
      {
        path: 'users',
        children: [
          {
            path: ':id',
            component: UserDetailComponent,
            resolve: {
              user: DataResolver,
              clients: DataArrayResolver
            },
            data: {
              modelName: 'EndUser',
              arrayModelName: 'Client'
            }
          },
          {
            path: '',
            component: UsersComponent,
            resolve: { users: DataArrayResolver },
            data: { arrayModelName: 'EndUser' }
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
