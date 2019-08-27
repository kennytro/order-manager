import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { DataApiService } from '../../../../services/data-api.service';

@Component({
  selector: 'app-user-logs',
  templateUrl: './user-logs.component.html',
  styleUrls: ['./user-logs.component.css']
})
export class UserLogsComponent implements OnInit {
  limits = [10, 30, 50];
  limitSelection: FormControl;
  private _limit;

  displayedColumns: string[] = ['type', 'event', 'date'];  
  logs: MatTableDataSource<any>;

  private _unsubscribe = new Subject<boolean>();

  private _userId: string;
  @Input()
  set userId(id: string) {
    if (this._userId !== id) {
      this._userId = id;
      this._updateChart();
    }
  }
  get userId(): string { return this._userId; }

  constructor(private _dataApi: DataApiService) {
    this._limit = this.limits[0];
  }

  ngOnInit() {
    this.limitSelection = new FormControl(this.limits[0]);
    this.limitSelection.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(limit => {
        if (this._limit !== limit) {
          this._limit = limit;
          this._updateChart();
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  fromNow(date): string {
    return moment(date).fromNow();
  }

  typeIcon(dataType: string): string {
    if (dataType === 'Order') {
      return "shopping-cart";
    }
    if (dataType === 'Statement') {
      return 'file-invoice-dollar';
    }
    if (dataType === 'User') {
      return 'user'
    }
    return 'question-circle';
  }

  private _updateChart() {
    if (this._userId) {
      this._dataApi.genericMethod('EndUser', 'getLogs', [this._userId, this._limit])
        .pipe(take(1))
        .subscribe(data => {
          this.logs = new MatTableDataSource(data);
        });
    }
  }
}
