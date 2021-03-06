import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/orders/orders/orders.component';
import { NewOrderComponent } from './components/orders/new-order/new-order.component';
import { OrderDetailComponent } from './components/orders/order-detail/order-detail.component';
import { StatementsComponent } from './components/statements/statements/statements.component';
import { StatementDetailComponent } from './components/statements/statement-detail/statement-detail.component';
import { MessagesComponent } from './components/messages/messages/messages.component';

import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { OrderResolver } from './services/order.resolver';

const routes: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    resolve: { client: DataResolver },
    data: { modelName: 'Client' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'orders',
        children: [
          {
            path: '',
            component: OrdersComponent,
            resolve: { orders: DataArrayResolver },
            data: { arrayModelName: 'Order' }
          },
          {
            path: 'new',
            component: NewOrderComponent,
            resolve: { 
              endUser: DataResolver,
              products: DataArrayResolver
            },
            data: {
              modelName: 'EndUser',
              arrayModelName: 'Product'
            }
          },
          {
            path: ':id',
            component: OrderDetailComponent,
            resolve: {
              orderInfo: OrderResolver
            }            
          }
        ]
      },
      { path: 'statements',
        children: [
          {
            path: '',
            component: StatementsComponent,
            resolve: { statements: DataArrayResolver },
            data: { arrayModelName: 'Statement'}
          },
          {
            path: ':id',
            component: StatementDetailComponent,
            resolve: { statement: DataResolver },
            data: {
              modelName: 'Statement',
              filter: { include: ['order', 'client'] }
            }
          }
        ]
      },
      {
        path: 'messages',
        children: [
          {
            path: '',
            component: MessagesComponent,
            resolve: { messages: DataArrayResolver },
            data: { arrayModelName: 'Message' }
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
export class CustomerRoutingModule { };
