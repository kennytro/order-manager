import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialogRef } from '@angular/material';
import { take } from 'rxjs/operators';
import { DataApiService } from '../../../../services/data-api.service';

export interface CheckInventoryDialogData {
  orderIds: Array<string>
}

@Component({
  selector: 'app-check-inventory',
  templateUrl: './check-inventory.component.html',
  styleUrls: ['./check-inventory.component.css']
})
export class CheckInventoryComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description', 'category', 'totalOrderQty', 'inventoryCount'];
  productList: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;
  showSpinner = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: CheckInventoryDialogData,
    private _dialogRef: MatDialogRef<CheckInventoryComponent>,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    if (this.dialogData.orderIds.length > 0) {
      this._dataApi.genericMethod('Order', 'getInventoryList', [this.dialogData.orderIds])
        .pipe(take(1))
        .subscribe(productList => {
          this._setTableDataSource(productList);
          this.showSpinner = false;
        });
    }
  }

  async generatePDF() {
    // TO DO: generate PDF and download it.
    console.log('clicked PDF.');
  }

  private _setTableDataSource(productList) {
    this.productList = new MatTableDataSource(productList);
    this.productList.sort = this.sort;
  }
}
