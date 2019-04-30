import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { PublicHomeResolver } from './services/public-home.resolver';
import { ClientComponent } from './components/client/client.component';
import { ClientResolver } from './services/client.resolver';
import { ProductComponent } from './components/product/product.component';
import { ProductResolver } from './services/product.resolver';
import { ProcessComponent } from './components/process/process.component';
import { ProcessResolver } from './services/process.resolver';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { ContactUsResolver } from './services/contact-us.resolver';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: PublicHomeComponent, resolve: { content: PublicHomeResolver } },
      { path: 'client', component: ClientComponent, resolve: { content: ClientResolver } },
      { path: 'product', component: ProductComponent, resolve: { content: ProductResolver } },
      { path: 'process', component: ProcessComponent , resolve: { content: ProcessResolver }},
      { path: 'contactus', component: ContactUsComponent/*, resolve: { content: ContactUsResolver }*/ },
      { path: 'login', component: LoginComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
