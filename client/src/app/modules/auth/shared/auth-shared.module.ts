import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CustomMaterialModule } from '../../../shared/custom-material.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  imports: [ CommonModule, FormsModule, FontAwesomeModule, CustomMaterialModule ],
  declarations: [ ConfirmDialogComponent ],
  exports: [ CommonModule, FormsModule, FontAwesomeModule, CustomMaterialModule, ConfirmDialogComponent],
  entryComponents: [
    ConfirmDialogComponent
  ]
})
export class AuthSharedModule { }
