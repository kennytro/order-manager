import { NgModule } from '@angular/core';
import { 
  MatButtonModule, MatCardModule, MatDialogModule, MatDividerModule, MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatSelectModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule, MatStepperModule,
  MatTableModule, MatTooltipModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

const modules = [
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTooltipModule,
  FlexLayoutModule,
  ReactiveFormsModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class CustomMaterialModule { }
