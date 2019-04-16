import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import map from 'lodash/map';

@Component({
  selector: 'app-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.css']
})
export class StatementsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'client', 'totalAmount', 'paidAmount', 'createdDate', 'updatedDate', 'note'];
  statements: MatTableDataSource<StatementSummary>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['statements']) {
        this._setTableDataSource(routeData['statements']);
      }
    })
  }

  applyFilter(filterValue: string) {
    this.statements.filter = filterValue.trim().toLowerCase();

    if (this.statements.paginator) {
      this.statements.paginator.firstPage();
    }
  }

  addStatement() {
    console.log('Clicked add statement');
  }

  private _setTableDataSource(statements: Array<any>) {
    this.statements = new MatTableDataSource(map(statements, statement => {
      let client = statement.client;
      return {
        id: statement.id,
        clientId: client.id,
        clientName: client.name,
        totalAmount: statement.totalAmount,
        paidAmount: statement.paidAmount,
        createdAt: statement.createdAt,
        updatedAt: statement.updatedAt,
        note: statement.note
      };
    }));
    this.statements.paginator = this.paginator;
    this.statements.sort = this.sort;   
  } 

}
