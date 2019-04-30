import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface SettingsData {
  productList: Array<ProductSummary>,
  exclusionList: Array<string>
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  // constructor(
  //   private _dialogRef: MatDialogRef<SettingsComponent>,
  //   @Inject(MAT_DIALOG_DATA) private inputData: SettingsData) {
  //  }
  constructor(
    private _dialogRef: MatDialogRef<SettingsComponent>
  ) {}

  ngOnInit() {
  }

  ngOnDestroy() { }
}
