import { NgModule } from '@angular/core';
import { TextMaskModule } from 'angular2-text-mask';

const modules = [
  TextMaskModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class SharedModule { }
