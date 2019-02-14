import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeLayoutComponent } from './components/employee-layout/employee-layout.component';
const routes: Routes = [
  {
    path: '',
    component: EmployeeLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { };
