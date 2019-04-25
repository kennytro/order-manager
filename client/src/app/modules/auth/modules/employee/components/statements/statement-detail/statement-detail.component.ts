import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';

import { ConfirmDialogComponent, DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertService } from '../../../../../shared/services/alert.service';
import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

import { EditAdjustComponent } from '../edit-adjust/edit-adjust.component';

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
  //   products: any; not used for now.
  statementFG: FormGroup;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _location: Location,
    private _editAdjustDialog: MatDialog,
    private _alertSvc: AlertService,
    private _snackBar: MatSnackBar,
    private _fs: FileService,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    /***** Form initialization *****/
    this.statementFG = this._formBuilder.group({
      statementDate: ['', Validators.required],
      adjustReason: [''],
      note: ['']
    });

    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
        if (routeData['statementInfo']) {
          let statementInfo = routeData['statementInfo'];
          this.statement = statementInfo.statement;
          // this.products = statementInfo.products;

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
          this._updateForm();
        }
      });
  }

  ngOnDestroy() {
  }

  getEmailCreated() {
    return this.statement.userCreated.email;
  }

  editAdjustAmount() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      amount: this.statement.adjustAmount,
      reason: this.statement.adjustReason
    };
    const dialogRef = this._editAdjustDialog.open(EditAdjustComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.statement.adjustAmount = Number(result.amount);
        this.statement.adjustReason = result.reason;
        this.statementFG.get('adjustReason').setValue(result.reason);
        this.statementFG.get('adjustReason').markAsDirty();
        this._updateTotalAmount();
      }
    })
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

  async delete() {
    this._alertSvc.confirm('Are you sure?', 'Deleting this statement cannot be undone', async () => {
      await this._dataApi.destroyById('Statement', this.statement.id.toString()).toPromise();
      this._alertSvc.alertSuccess('Success', `Successfully deleted statement(id: ${this.statement.id})`, () => {
        // this._router.navigate(['../'], { relativeTo: this._route });
        this.close();
      });
    });
  }

  async save() {
    try {
      let orderIds = this.statement.order.map(order => order.id);
      this.statement.statementDate = this.statementFG.get('statementDate').value;
      this.statement.note = this.statementFG.get('note').value;
      let status = await this._dataApi.genericMethod('Statement', 'updateStatement', [this.statement, orderIds]).toPromise();
      const snackBarRef = this._snackBar.open(`Statement(id: ${status.statementId}) successfully updated`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._router.navigate(['../'], { relativeTo: this._route});
    } catch (err) {
      console.log(`error: failed to update a statement - ${err.message}`);      
    }
  }

  private _updateTotalAmount() {
    this.statement.totalAmount = Number(this.statement.subtotalAmount) + Number(this.statement.adjustAmount);
  }

  private _updateForm() {
    this.statementFG.get('statementDate').setValue(this.statement.statementDate);
    this.statementFG.get('adjustReason').setValue(this.statement.adjustReason);
    this.statementFG.get('note').setValue(this.statement.note);
  }
}
