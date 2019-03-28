import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-layout',
  templateUrl: './order-layout.component.html',
  styleUrls: ['./order-layout.component.css']
})
export class OrderLayoutComponent implements OnInit {
  navLinks: any[];
  constructor(private _router: Router) {
    this.navLinks = [
      {
        label: `Today's Orders`,
        link: './today',
        index: 0
      }, {
        label: 'Open Orders',
        link: './open',
        index: 1
      }, {
        label: 'Closed Orders',
        link: './closed',
        index: 2
      }
    ];
   }

  ngOnInit() {
  }

  addOrder() {
    console.log('clicked New Order button');
  }
}
