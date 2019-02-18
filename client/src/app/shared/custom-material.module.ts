import { NgModule } from '@angular/core';
import { MatTableModule, MatSortModule, MatPaginatorModule,
         MatFormFieldModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule],
  exports: [MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule]
})
export class CustomMaterialModule { }
