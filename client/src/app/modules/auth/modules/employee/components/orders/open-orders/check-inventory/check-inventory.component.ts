import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialogRef } from '@angular/material';
import { take } from 'rxjs/operators';
import { DataApiService } from '../../../../services/data-api.service';
import { PdfService } from '../../../../services/pdf.service';

export interface CheckInventoryDialogData {
  orderIds: Array<string>
}

@Component({
  selector: 'app-check-inventory',
  templateUrl: './check-inventory.component.html',
  styleUrls: ['./check-inventory.component.css']
})
export class CheckInventoryComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description', 'category', 'totalOrderCount', 'inventoryCount'];
  productList: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;
  showSpinner = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: CheckInventoryDialogData,
    private _dialogRef: MatDialogRef<CheckInventoryComponent>,
    private _dataApi: DataApiService,
    private _pdfSvc: PdfService
  ) { }

  ngOnInit() {
    if (this.dialogData.orderIds.length > 0) {
      this._dataApi.genericMethod('Order', 'getInventoryList', [this.dialogData.orderIds])
        .pipe(take(1))
        .subscribe(productList => {
          this._setTableDataSource(productList);
          this.showSpinner = false;
        });
    } else {
      this.showSpinner = false;
    }
  }

  async generatePDF() {
    // this._dataApi.genericGetFile('Order', 'getInventoryListInPdf', [this.dialogData.orderIds])
    this._pdfSvc.downloadPDF('Order', 'getInventoryListInPdf', [this.dialogData.orderIds])
    .pipe(take(1))
    .subscribe(pdfFile => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(pdfFile);
      element.download =  `inventory_list.pdf`;
      // Firefox requires the element to be in the body
      document.body.appendChild(element);
      //simulate click
      element.click();
      //remove the element when done
      document.body.removeChild(element);
    });
  }

  private _setTableDataSource(productList) {
    this.productList = new MatTableDataSource(productList);
    this.productList.sort = this.sort;
  }
}
