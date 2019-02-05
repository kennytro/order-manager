import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { ClientComponent } from './components/client/client.component';
import { ProductComponent } from './components/product/product.component';
import { ProcessComponent } from './components/process/process.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  {
    path: 'public',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: PublicHomeComponent },
      { path: 'client', component: ClientComponent },
      { path: 'product', component: ProductComponent },
      { path: 'process', component: ProcessComponent },
      { path: 'contactus', component: ContactUsComponent },
      { path: 'login', component: LoginComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
