import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthHomeComponent } from './components/auth-home/auth-home.component';

const routes: Routes = [
  {
    path: '',
    component: AuthHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
