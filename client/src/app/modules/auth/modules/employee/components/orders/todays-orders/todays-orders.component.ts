import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subject } from 'rxjs';
import { take, takeUntil, debounceTime } from 'rxjs/operators';
import * as moment from 'moment';

import { FileService } from '../../../../../shared/services/file.service';
import { SocketService } from '../../../../../shared/services/socket.service';
import { DataApiService } from '../../../services/data-api.service';


@Component({
  selector: 'app-todays-orders',
  providers: [ SocketService ],
  templateUrl: './todays-orders.component.html',
  styleUrls: ['./todays-orders.component.css']
})
export class TodaysOrdersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'status', 'client', 'totalAmount', 'createdDate', 'note', 'pdf'];
  orders: MatTableDataSource<OrderSummary>;
  private _unsubscribe = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _route: ActivatedRoute,
    private _socketService: SocketService,
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
    this._socketService.initSocket('order');
    this._socketService.onModel('order')
      .pipe(takeUntil(this._unsubscribe), debounceTime(1000))
      .subscribe((data) => {
        console.log(`Received message on model \'order\' - (${JSON.stringify(data)})`);
        this._refreshOrderTable();
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this.orders.filter = filterValue.trim().toLowerCase();

    if (this.orders.paginator) {
      this.orders.paginator.firstPage();
    }
  }

  downloadPdf(orderId: string) {
    this._dataApi.genericMethod('Order', 'getOrderInvoicePdfUrl', [orderId])
      .pipe(take(1))    // maybe not necessary?
      .subscribe(url => {
        console.debug(`file url: ${url}`);
        this._fs.downloadPDF(url)
          .subscribe(res => {
            if (res) {
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
            } else {
              console.debug('received null response');
              // TODO: display a snackbar?
            }
          });
      });
  }

  private _refreshOrderTable() {
    this._dataApi.find('Order', {
      where: {
        createdAt: { gt: moment().startOf('day')}
      },
      include: [{
        relation: 'client',
        scope: {
          fields: { id: true, name: true }
        }
      }]      
    })
      .pipe(take(1))
      .subscribe(orders => {
        this._setTableDataSource(orders);
      });
  }

  private _setTableDataSource(orders: Array<any>) {
    this.orders = new MatTableDataSource(orders.map(order => {
      let client = order.client;
      return {
        id: order.id,
        clientId: client.id,
        clientName: client.name,
        status: order.status,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        note: order.note,
        hasInvoice: order.hasInvoice
      };
    }));
    this.orders.paginator = this.paginator;
    this.orders.sort = this.sort;   
  } 
}
