import { NgModule } from '@angular/core';
import { 
  MatButtonModule, MatCardModule, MatDialogModule, MatDividerModule, MatFormFieldModule,
  MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule
} from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  FlexLayoutModule,
  ReactiveFormsModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class CustomMaterialModule { }
