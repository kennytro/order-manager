import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { take, takeUntil } from 'rxjs/operators';

import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'app-statement-detail',
  templateUrl: './statement-detail.component.html',
  styleUrls: ['./statement-detail.component.css']
})
export class StatementDetailComponent implements OnInit {
  displayedColumns: string[] = ['id', 'totalAmount', 'createdDate', 'note'];  
  statement: any;
  orders: MatTableDataSource<OrderSummary>;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _fs: FileService,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
        if (routeData['statement']) {
          this.statement = routeData['statement'];

          let orders = sortBy(this.statement.order, ['id', 'createdAt']);
          this.orders = new MatTableDataSource(map(orders, order => {
            return {
              id: order.id,
              status: order.status,
              createdAt: order.createdAt,
              totalAmount: order.totalAmount,
              note: order.note
            };
          }));
        }
      });
  }

  ngOnDestroy() {
  }

  downloadPdf() {
    this._dataApi.genericMethod('Statement', 'getStatementPdfUrl', [this.statement.id])
      .pipe(take(1))    // maybe not necessary?
      .subscribe(url => {
        console.debug(`file url: ${url}`);
        this._fs.downloadPDF(url)
          .subscribe(res => {
            console.debug('download is done.');
            const element = document.createElement('a');
            element.href = URL.createObjectURL(res);
            element.download =  `statement_${this.statement.id}.pdf`;
            // Firefox requires the element to be in the body
            document.body.appendChild(element);
            //simulate click
            element.click();
            //remove the element when done
            document.body.removeChild(element);
          });
      });    
  }

  close() {
    if (window.history.length > 1) {
      this._location.back();
    } else {
      this._router.navigate(['../'], { relativeTo: this._route });  // navigate to '/orders/'
    }
  }
}
