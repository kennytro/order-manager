import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig, MatSnackBar, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { EditAdjustComponent } from '../edit-adjust/edit-adjust.component';

import { DataApiService } from '../../../services/data-api.service';

import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'app-new-statement',
  templateUrl: './new-statement.component.html',
  styleUrls: ['./new-statement.component.css']
})
export class NewStatementComponent implements OnInit {
  displayedColumns: string[] = ['select', 'id', 'totalAmount', 'createdDate', 'note'];  
  displayedColumnsForReview: string[] = ['id', 'totalAmount', 'createdDate', 'note'];

  statement: any;
  candidateOrders: MatTableDataSource<OrderSummary>;
  orderSelection: SelectionModel<OrderSummary>;
  clientList: Array<any>;
  selectedClient: any;
  statementFG: FormGroup;
  private _unsubscribe = new Subject<boolean>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _editAdjustDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) {
    this._resetStatement();
  }

  ngOnInit() {
    /***** Form initialization *****/
    this.statementFG = this._formBuilder.group({
      clientId: ['', Validators.required],
      orders: this._formBuilder.array([]),
      adjustReason: [''],
      note: ['']
    });

    // update order table upon change of client
    this.statementFG.get('clientId').valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(clientId => {
        this._resetStatement();
        this.selectedClient = this.clientList.find(client => client.id === clientId);
        this.statement.clientId = this.selectedClient.id;
        this.statementFG.get('adjustReason').reset();
        this.statementFG.get('note').reset();
        this._updateOrderList();
    });

    /***** Data initialization: client list *****/
    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
        if (routeData['clients']) {
          const clientsWithOrder = routeData['clients'];
          if (clientsWithOrder.length == 0) {
            // HACK - https://github.com/angular/angular/issues/15634#issuecomment-345504902
            setTimeout(() => {
              const snackBarRef = this._snackBar.open('There is no completed order ready for a statement.',
                'Close', { duration: 3000 });
              snackBarRef.onAction().subscribe(() => {
                snackBarRef.dismiss();
              });
            }, 1000);
          }
          this.clientList = clientsWithOrder.map(client => {
            return {
              id: client.id,
              name: client.name
            };
          });
        }
    });
    this._updateOrderList();
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  isAllSelected() {
    const numSelected = this.orderSelection.selected.length;
    const numRows = this.candidateOrders.data.length;
    return numSelected == numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.orderSelection.clear() :
      this.candidateOrders.data.forEach(row => this.orderSelection.select(row));
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
        this.statement.adjustAmount = result.amount;
        this.statement.adjustReason = result.reason;
        this.statementFG.get('adjustReason').setValue(result.reason);
        this._updateTotalAmount();
      }
    })
  }

  getOrderTableSourceForReview() {
    return new MatTableDataSource(this.orderSelection.selected);
  }

  async create() {
    try {
      let orderIds = this.orderSelection.selected.map(order => order.id);
      this.statement.note = this.statementFG.get('note').value;
      let status = await this._dataApi.genericMethod('Statement', 'createNew', [this.statement, orderIds]).toPromise();
      const snackBarRef = this._snackBar.open(`Statement(id: ${status.statementId}) successfully created`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._router.navigate(['../'], { relativeTo: this._route});
    } catch (err) {
      console.log(`error: failed to create a statement - ${err.message}`);      
    }
  }

  private _resetStatement() {
    this.statement = {
      clientId: null,
      subtotalAmount: 0,
      adjustAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      adjustReason: null,
      note: null
    };
  }

  private _updateTotalAmount() {
    let newSubtotal = 0;
    this.orderSelection.selected.forEach(selected => {
      newSubtotal += Number(selected.totalAmount);
    });
    this.statement.subtotalAmount = newSubtotal;
    this.statement.totalAmount = this.statement.subtotalAmount + this.statement.adjustAmount;
  }

  private async _updateOrderList() {
    if (this.statement.clientId) {
      let orders = await this._dataApi.genericMethod('Client', 'findStatementReadyOrder', this.statement.clientId).toPromise();
      orders = sortBy(orders, ['id', 'createdAt']);
      this.candidateOrders = new MatTableDataSource(map(orders, order => {
        return {
          id: order.id,
          status: order.status,
          createdAt: order.createdAt,
          totalAmount: order.totalAmount,
          note: order.note
        };
      }));
    } else {
      this.candidateOrders = new MatTableDataSource([]);
    }
    this.orderSelection = new SelectionModel<OrderSummary>(true, []);
    this.orderSelection.onChange
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(x => {
        this._updateTotalAmount();
      })
  }
}
