import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import { NewProductComponent } from '../new-product/new-product.component';
import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'name', 'description', 'category', 'unitPrice', 'inventoryCount'];
  private _products: MatTableDataSource<any>;

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
    this._products = new MatTableDataSource(products);
    this._products.paginator = this.paginator;
    this._products.sort = this.sort;   
  }
}
