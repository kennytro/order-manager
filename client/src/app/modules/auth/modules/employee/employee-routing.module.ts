import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as moment from 'moment';


import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StatementsComponent } from './components/statements/statements/statements.component';
import { NewStatementComponent } from './components/statements/new-statement/new-statement.component';
import { StatementDetailComponent } from './components/statements/statement-detail/statement-detail.component';
import { OrderLayoutComponent } from './components/orders/order-layout/order-layout.component';
import { TodaysOrdersComponent } from './components/orders/todays-orders/todays-orders.component';
import { OpenOrdersComponent } from './components/orders/open-orders/open-orders.component';
import { ClosedOrdersComponent } from './components/orders/closed-orders/closed-orders.component';
import { OrderDetailComponent } from './components/orders/order-detail/order-detail.component';
import { NewOrderComponent } from './components/orders/new-order/new-order.component';
import { ClientsComponent } from './components/clients/clients/clients.component';
import { ClientDetailComponent } from './components/clients/client-detail/client-detail.component'; 
import { UsersComponent } from './components/users/users/users.component';
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { DeliveryRoutesComponent } from './components/delivery-routes/delivery-routes/delivery-routes.component';
import { DeliveryRouteDetailComponent } from './components/delivery-routes/delivery-route-detail/delivery-route-detail.component';
import { ProductsComponent } from './components/products/products/products.component';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';

import { DataResolver } from './services/data.resolver';
import { DataArrayResolver } from './services/data-array.resolver';
import { OrdersResolver } from './services/orders.resolver';
import { OrderResolver } from './services/order.resolver';
import { StatementsResolver } from './services/statements.resolver';
import { StatementResolver } from './services/statement.resolver';
import { ClientsResolver } from './services/clients.resolver';

const routes: Routes = [
  {
    path: '',
    component: EmployeeLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'statements',
        children: [
          {
            path: 'new',
            component: NewStatementComponent,
            resolve: { clients: ClientsResolver },
            data: {
              forStatement: true
            }
          },
          {
            path: ':id',
            component:StatementDetailComponent,
            resolve: { statementInfo: StatementResolver }
          },
          {
            path: '',
            component: StatementsComponent,
            resolve: { statements: StatementsResolver },
            data: {
              filter: {
                include: [{
                  relation: 'client',
                  scope: {
                    fields: { id: true, name: true }
                  }
                }]
              }
            }
          }
        ]
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            component: OrderLayoutComponent,
            children: [
              { path: '', redirectTo: 'today', pathMatch: 'full' },
              { path: 'today',
                component: TodaysOrdersComponent,
                resolve: { orders: OrdersResolver },
                data: { 
                  filter: {
                    where: {
                      createdAt: { gt: moment().startOf('day')}
                    },
                    include: [{
                      relation: 'client',
                      scope: {
                        fields: { id: true, name: true }
                      }
                    }]
                  }
                }
              },
              {
                path: 'open',
                component: OpenOrdersComponent, 
                resolve: { orders: OrdersResolver },
                data: {
                  filter: {
                    where: {
                      status: { nin: ['Completed', 'Cancelled']}
                    },
                    include: [{
                      relation: 'client',
                      scope: {
                        fields: { id: true, name: true }
                      }
                    }]                
                  }
                }
              },
              {
                path: 'closed',
                component: ClosedOrdersComponent, 
                resolve: { orders: OrdersResolver },
                data: {
                  filter: {
                    where: {
                      status: { inq: ['Completed', 'Cancelled']}
                    },
                    include: [{
                      relation: 'client',
                      scope: {
                        fields: { id: true, name: true }
                      }
                    }]                
                  }
                }
              }
            ]
          },
          {
            path: 'new',
            component: NewOrderComponent,
            resolve: { clients: DataArrayResolver },
            data: { arrayModelName: 'Client' }
          },
          {
            path: ':id',
            component: OrderDetailComponent,
            resolve: { orderInfo: OrderResolver }
          }
        ]
      },
      {
        path: 'products',
        children: [
          {
            path: ':id',
            component: ProductDetailComponent,
            resolve: { product: DataResolver },
            data: { modelName: 'Product' }
          },
          {
            path: '',
            component: ProductsComponent,
            resolve: { products: DataArrayResolver },
            data: { arrayModelName: 'Product' }
          }
        ]
      },
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
      },
      {
        path: 'delivery-routes',
        children: [
          {
            path: ':id',
            component: DeliveryRouteDetailComponent,
            resolve: { route: DataResolver },
            data: { modelName: 'DeliveryRoute'}
          },
          {
            path: '',
            component: DeliveryRoutesComponent,
            resolve: { routes: DataArrayResolver },
            data: { arrayModelName: 'DeliveryRoute' }
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
