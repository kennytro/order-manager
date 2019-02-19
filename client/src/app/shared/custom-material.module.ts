import { NgModule } from '@angular/core';
import { MatTableModule, MatSortModule, MatPaginatorModule,
         MatFormFieldModule, MatDialogModule, MatDividerModule,
         MatButtonModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';

const modules = [
  MatButtonModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatSortModule,
  MatTableModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class CustomMaterialModule { }
