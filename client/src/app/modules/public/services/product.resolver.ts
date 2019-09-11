import { Injectable } from '@angular/core';
import { Resolve } from "@angular/router";
import { HttpClient } from '@angular/common/http';

import { LocalScopeShareService } from './local-scope-share.service';
import { ContentService } from './content.service';

export interface Product {
  name: string,
  description: string,
  category: string,
  unitPrice: number,
  unit: string,
  imageUrl: string,
  createdDate: Date,
  isNew?: boolean
}

@Injectable()
export class ProductResolver extends ContentService implements Resolve<string> {
  constructor(http: HttpClient, dataShare: LocalScopeShareService) {
    super(http, dataShare);
  }

  resolve() {
    return this.getContent('product');
  }

  getProducts() {
    return this.http.get<Product[]>('/public/products');
  }
}