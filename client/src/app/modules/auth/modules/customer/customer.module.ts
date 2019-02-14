import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';

import { CustomerLayoutComponent } from './components/customer-layout/customer-layout.component';


@NgModule({
  declarations: [CustomerLayoutComponent],
  imports: [
    CommonModule,
    CustomerRoutingModule
  ]
})
export class CustomerModule { }
