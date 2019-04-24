import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { take} from 'rxjs/operators';

import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

import map from 'lodash/map';

@Component({
  selector: 'app-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.css']
})
export class StatementsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'client', 'statementDate','totalAmount', 'note', 'pdf'];
  statements: MatTableDataSource<StatementSummary>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _route: ActivatedRoute,
    private _fs: FileService,
    private _dataApi: DataApiService
  ) { }

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

  downloadPdf(statementId: string) {
    this._dataApi.genericMethod('Statement', 'getStatementPdfUrl', [statementId])
      .pipe(take(1))    // maybe not necessary?
      .subscribe(url => {
        console.debug(`file url: ${url}`);
        this._fs.downloadPDF(url)
          .subscribe(res => {
            console.debug('download is done.');
            const element = document.createElement('a');
            element.href = URL.createObjectURL(res);
            element.download =  `statement_${statementId}.pdf`;
            // Firefox requires the element to be in the body
            document.body.appendChild(element);
            //simulate click
            element.click();
            //remove the element when done
            document.body.removeChild(element);
          });
      });
  }

  private _setTableDataSource(statements: Array<any>) {
    this.statements = new MatTableDataSource(map(statements, statement => {
      let client = statement.client;
      return {
        id: statement.id,
        clientId: client.id,
        clientName: client.name,
        statementDate: statement.statementDate,
        totalAmount: statement.totalAmount,
        note: statement.note
      };
    }));
    this.statements.paginator = this.paginator;
    this.statements.sort = this.sort;   
  } 

}
