import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialogRef } from '@angular/material';
import { take } from 'rxjs/operators';

import { DataApiService } from '../../../../services/data-api.service';
import { PdfService } from '../../../../services/pdf.service';

export interface PackageDistributionDialogData {
  orderIds: Array<string>
}

@Component({
  selector: 'app-package-distribution',
  templateUrl: './package-distribution.component.html',
  styleUrls: ['./package-distribution.component.css']
})
export class PackageDistributionComponent implements OnInit {
  displayedColumns: string[] = [
    'deliveryRouteId', 'orderId', 'clientId', 'productName',
    'productDescription', 'productCategory', 'productOrderCount'];
  distributionList: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;
  showSpinner = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: PackageDistributionDialogData,
    private _dialogRef: MatDialogRef<PackageDistributionComponent>,
    private _dataApi: DataApiService,
    private _pdfSvc: PdfService
   ) { }

  ngOnInit() {
    if (this.dialogData.orderIds.length > 0) {
      this._dataApi.genericMethod('Order', 'getPackageDistributionList', [this.dialogData.orderIds])
        .pipe(take(1))
        .subscribe(distributionList => {
          this._setTableDataSource(distributionList);
          this.showSpinner = false;
        });
    } else {
      this.showSpinner = false;
    }
  }

  applyFilter(filterValue: string) {
    this.distributionList.filter = filterValue.trim().toLowerCase();
  }

  async generatePDF() {
    // this._dataApi.genericGetFile('Order', 'getInventoryListInPdf', [this.dialogData.orderIds])
    this._pdfSvc.downloadPDF('Order', 'getPackageDistributionListInPdf', [this.dialogData.orderIds])
    .pipe(take(1))
    .subscribe(pdfFile => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(pdfFile);
      element.download =  `distribution_list.pdf`;
      // Firefox requires the element to be in the body
      document.body.appendChild(element);
      //simulate click
      element.click();
      //remove the element when done
      document.body.removeChild(element);
    });
  }

  private _setTableDataSource(distributionList) {
    this.distributionList = new MatTableDataSource(distributionList);
    setTimeout(() => {  // delay binding sort to the list.
      this.distributionList.sort = this.sort;
    });
  }
}
