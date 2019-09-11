import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import * as moment from 'moment';

import { ProductResolver } from '../../../services/product.resolver';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'category', 'unitPrice'];  
  fetchTime: Date;
  products: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;  
  constructor(private _productSvc: ProductResolver) { 
    this.fetchTime = new Date();
  }

  ngOnInit() {
    this._productSvc.getProducts()
      .subscribe(products => {
        products.forEach(product => {
          product.isNew = moment(product.createdDate).isAfter(moment().subtract(15, 'days'));
        });
        this.fetchTime = new Date();
        this.products = new MatTableDataSource(products);
        this.products.paginator = this.paginator;
        this.products.sort = this.sort;
      });
  }

  applyFilter(filterValue: string) {
    this.products.filter = filterValue.trim().toLowerCase();

    if (this.products.paginator) {
      this.products.paginator.firstPage();
    }
  }
}
