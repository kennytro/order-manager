import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ClientComponent } from './components/client/client.component';
import { ProductComponent } from './components/product/product.component';
import { ProcessComponent } from './components/process/process.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'client',
    component: ClientComponent
  },
  {
    path: 'product',
    component: ProductComponent
  },
  {
    path: 'process',
    component: ProcessComponent
  },
  {
    path: 'contactus',
    component: ContactUsComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
