import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { take } from 'rxjs/operators';

import { DataApiService } from '../../../../services/data-api.service';
import { PdfService } from '../../../../services/pdf.service';

@Component({
  selector: 'app-package-distribution',
  templateUrl: './package-distribution.component.html',
  styleUrls: ['./package-distribution.component.css']
})
export class PackageDistributionComponent implements OnInit {
  productMap = new Map();
  distributionMap = new Map();
  routeList = [];
  clientNames: string[] = [];
  orderColumns: string[] = ['id', 'clientName'];
  orderList: MatTableDataSource<any> = new MatTableDataSource([]);  
  displayedColumns: string[] = [];
  distributionList: MatTableDataSource<any> = new MatTableDataSource([]);

  @ViewChild(MatSort) productSort: MatSort;  
  constructor(
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService,
    private _pdfSvc: PdfService
   ) { }

  ngOnInit() {
    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
        if (routeData['orders']) {
          this._initOrderData(routeData['orders']);
        }
    });
  }

  ngOnDestroy() {
  }

  changeRoute(event) {
    this._setTableDataSource(event.source.value);
  }

  applyFilter(filterValue: string) {
    this.distributionList.filter = filterValue.trim().toLowerCase();
  }

  async moveOrdersToShipped() {
    const orderIds = this.orderList.data.map(order => order.id);    
    if (orderIds.length > 0) {
      try {
        await this._dataApi.genericMethod('Order', 'updateAll', [{ id: { inq: orderIds } },
          { status: 'Shipped' }]).toPromise();
        this._snackBar.open('Successfully moved all orders to \'Shipped\' status',
          'Close', { duration: 3000 });
      } catch (err) {
        console.log(`error: failed to change order status - ${err.message}`);
      }
    }
  }

  async generatePDF() {
    const orderIds = this.orderList.data.map(order => order.id);    
    if (orderIds.length > 0) {
      this._pdfSvc.downloadPDF('Order', 'getPackageDistributionListInPdf', [orderIds])
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
  }

  private _initOrderData(orders) {
    // init order IDs
    this.orderList = new MatTableDataSource(orders.map(function(order) {
      return {
        id: order.id,
        clientName: order.client.name
      }
    }));

    // init routeList
    let routeSet = new Set();
    orders.forEach(function(order) {
      routeSet.add(order.client.deliveryRouteId);
    })
    this.routeList = Array.from(routeSet.values());
    this.routeList.sort();
    // init productMap
    orders.forEach((order) => {
      order.orderItem.forEach((orderItem) => {
        const product = orderItem.product;
        if (!this.productMap.has(product.id)) {
          this.productMap.set(product.id, product);
        }
      });
    });

    this._initDistributionMap(orders, this.routeList);
    this._setTableDataSource(this.routeList[0]);
  }

  private _initDistributionMap(orders, routeList) {
    // init distribution map
    for (let route of routeList) {
      this.distributionMap.set(route, new Map());
    }
    orders.forEach((order) => {
      const routeId = order.client.deliveryRouteId;
      const clientId = order.client.id;
      const clientName = order.client.name;
      let prodMap = this.distributionMap.get(routeId);
      order.orderItem.forEach((orderItem) => {
        const product = orderItem.product;
        let totalQuantity = Number(orderItem.quantity);
        if (prodMap.has(product.id)) {
          let clientMap = prodMap.get(product.id);
          if (clientMap.has(clientName)) {
            totalQuantity += clientMap.get(clientName);
          }
          clientMap.set(clientName, totalQuantity);
        } else {
          prodMap.set(product.id, new Map([[clientName, Number(orderItem.quantity)]]));
        }
      });
    });    
  }

  private _setTableDataSource(deliveryRouteId) {
    const prodMap = this.distributionMap.get(deliveryRouteId);
    let clientSet = new Set();
    prodMap.forEach((clientMap, productName) => {
      clientMap.forEach((quantity, clientName) => {
        clientSet.add(clientName);
      });
    });

    this.clientNames = Array.from(clientSet.values());
    this.displayedColumns = ['productId', 'productName', 'productDescription'].concat(this.clientNames);
    this.displayedColumns.push('totalCount');
    let distData = [];
    prodMap.forEach((clientMap, productId) => {
      const product = this.productMap.get(productId);
      let prodData = {
        id: product.id,
        name: product.name,
        description: product.description,
        productImageUrl: product.settings.imageUrl,
        totalCount: 0
      };
      clientSet.forEach(function(clientName) {
        prodData[clientName] = 0;
      });

      clientMap.forEach(function(quantity, clientName) {
        prodData[clientName] = quantity;
        prodData['totalCount'] += quantity;
      });
      distData.push(prodData);
    });
    this.distributionList = new MatTableDataSource(distData);
    this.distributionList.sort = this.productSort;
  }
}
