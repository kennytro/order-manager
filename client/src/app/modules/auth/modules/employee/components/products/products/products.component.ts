import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NewProductComponent } from '../new-product/new-product.component';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'name', 'description', 'category', 'originCountry', 'unitPrice'];
  private _products: MatTableDataSource<any>;
  private _unsubscribe = new Subject<boolean>();  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _route: ActivatedRoute,
    private _newProductDialog: MatDialog,
    private _dataApi: DataApiService) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['products']) {
        this._setTableDataSource(routeData['products']);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this._products.filter = filterValue.trim().toLowerCase();

    if (this._products.paginator) {
      this._products.paginator.firstPage();
    }
  }

  getProductsCount() {
    return this._products.data.length;
  }

  getProducts() {
    return this._products;
  }

  addProduct() {
    const dialogRef = this._newProductDialog.open(NewProductComponent);
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        // refresh list to include the new item.
        // [IMPORTANT] - append 'settings' property to include image
        let productArray = await this._dataApi.find('Product', {
          fields: this.displayedColumns.concat('settings')
        }).toPromise();
        this._setTableDataSource(productArray);
      }
    })
  }

  private _setTableDataSource(products: Array<any>) {
    products.forEach((product) => {
      product.unitPriceFC = new FormControl(product.unitPrice);
      product.unitPriceFC.valueChanges
        .pipe(takeUntil(this._unsubscribe), debounceTime(1000), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
        .subscribe(value => {
          product.unitPrice = value;
          this._updateUnitPrice(product);
        })
    });
    this._products = new MatTableDataSource(products);
    this._products.paginator = this.paginator;
    this._products.sort = this.sort;   
  }

  private async _updateUnitPrice(product: any) {
    try {
      // updateAll() is better than 'upsertWithWhere' since it bypasses operation hooks of 'Product'
      await this._dataApi.genericMethod('Product', 'updateAll', [{ id: product.id }, {unitPrice: product.unitPrice}]).toPromise();
      console.log(`successfully saved price(id: ${product.id}, new price: ${product.unitPrice})`);
    } catch (err) {
      console.log(`error: failed to update price(id: ${product.id}, new price: ${product.unitPrice}) - ${err.message}`);
    }
  }
}
