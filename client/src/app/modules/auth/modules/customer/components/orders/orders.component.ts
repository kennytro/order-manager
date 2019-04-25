import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { take} from 'rxjs/operators';

import { FileService } from '../../../../shared/services/file.service';
import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'status', 'totalAmount', 'createdDate', 'lastUpdatedDate', 'note', 'pdf'];
  private _orders: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _route: ActivatedRoute,
    private _fs: FileService,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
        if (routeData['orders']) {
          this._setTableDataSource(routeData['orders']);
        }
      });
  }

  applyFilter(filterValue: string) {
    this._orders.filter = filterValue.trim().toLowerCase();

    if (this._orders.paginator) {
      this._orders.paginator.firstPage();
    }
  }

  getOrders() {
    return this._orders;
  }

  downloadPdf(orderId: string) {
    this._dataApi.genericMethod('Order', 'getOrderInvoicePdfUrl', [orderId])
      .pipe(take(1))    // maybe not necessary?
      .subscribe(url => {
        console.debug(`file url: ${url}`);
        this._fs.downloadPDF(url)
          .subscribe(res => {
            console.debug('download is done.');
            const element = document.createElement('a');
            element.href = URL.createObjectURL(res);
            element.download =  `order_invoice_${orderId}.pdf`;
            // Firefox requires the element to be in the body
            document.body.appendChild(element);
            //simulate click
            element.click();
            //remove the element when done
            document.body.removeChild(element);
          });
      });
  }

  private _setTableDataSource(orders: Array<any>) {
    this._orders = new MatTableDataSource(orders);
    this._orders.paginator = this.paginator;
    this._orders.sort = this.sort;   
  }  
}
