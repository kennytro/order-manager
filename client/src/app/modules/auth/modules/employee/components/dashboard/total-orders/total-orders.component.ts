import { Component, OnInit } from '@angular/core';
import { ChartReadyEvent, ChartSelectEvent } from 'ng2-google-charts';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil, filter } from 'rxjs/operators';

import * as moment from 'moment';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';

import { DataApiService } from '../../../services/data-api.service';
import { SocketService } from '../../../../../shared/services/socket.service';

@Component({
  selector: 'app-total-orders',
  providers: [ SocketService ],
  templateUrl: './total-orders.component.html',
  styleUrls: ['./total-orders.component.css']
})
export class TotalOrdersComponent implements OnInit {
  showSpinner:boolean;
  intervalList = [
    { label: 'Yearly',  format: 'YYYY', amountMetricName: 'total_sale_yearly', countMetricName: 'total_orders_yearly' },
    { label: 'Monthly', format: 'MMM', amountMetricName: 'total_sale_monthly', countMetricName: 'total_orders_monthly' },
    { label: 'Daily',  format: 'DD', amountMetricName: 'total_sale_daily', countMetricName: 'total_orders_daily' }
  ];
  intervalSelection: FormControl;
  startDate: moment.Moment;
  endDate: moment.Moment;
  orderChart: GoogleChartInterface;

  private _unsubscribe = new Subject<boolean>();

  constructor(
    private _dataApi: DataApiService,
    private _socketService: SocketService
  ) {
    this.startDate = moment().startOf('month');
    this.endDate = moment().endOf('month');
  }

  ngOnInit() {
    this.showSpinner = true;
    this.intervalSelection = new FormControl('Daily');
    this.intervalSelection.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(label => {
        this.updateDatesByInterval(label);
        this._getMetricData(label);
      });
    this._getMetricData('Daily');
    this._socketService.initSocket('metric');
    this._socketService.onModel('metric')
      .pipe(takeUntil(this._unsubscribe), filter(data => data.metricNames.includes('total_sale') || data.metricNames.includes('total_orders')))
      .subscribe((data) => {
        console.log(`Received message (${JSON.stringify(data)})`);
        this._getMetricData(this.intervalSelection.value);
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  /**
   * Stops spinner when chart is ready.
   * @param {Object} - ready event.
   */
   onReadyChart(event: ChartReadyEvent) {
    console.log('total orders chart is ready - ${event.message}');
    this.showSpinner = false;
  }

  /**
   * @param {number} - navigation direction, -1(previous) or 1(next)
   */
  onChangePeriod(direction:number) {
    this.updateDatesByPeriod(this.intervalSelection.value, direction);
    this._getMetricData(this.intervalSelection.value);
  }

  /**
   * Drill down to selected bar except on 'Daily' interval. 
   * 3 steps to handle select: 
   *  1. Update start/end dates based on current interval and selection
   *  2. Update interval selection without firing change event.
   *  3. Redraw chart with new metric data. 
   * @param {Object} - select event.
   */
  onSelect(event: ChartSelectEvent) {
    if (event.message === 'select' && this.intervalSelection.value !== 'Daily') {
      console.log(JSON.stringify(event));
      if (this.intervalSelection.value === 'Yearly') {
        this.startDate = moment().year(Number(event.selectedRowValues[0])).startOf('year');
        this.endDate = moment(this.startDate).endOf('year');
        this.intervalSelection.setValue('Monthly', { emitEvent: false });
      } else if (this.intervalSelection.value === 'Monthly') {
        this.startDate = moment(this.startDate).month(event.selectedRowValues[0]).startOf('month');
        this.endDate = moment(this.startDate).endOf('month');
        this.intervalSelection.setValue('Daily', { emitEvent: false });
      }
      console.log(`New range: start(${this.startDate.format('YYYY-MM-DD')}), end(${this.endDate.format('YYYY-MM-DD')})`);
      this._getMetricData(this.intervalSelection.value);      
    }
  }

  /**
   * Updates start/end date upon selecting an interval.
   * @param {string} - interval label
   */
  updateDatesByInterval(interval:string) {
    switch (interval) {
      case 'Yearly': {
        this.startDate = moment('2000-01-01');
        this.endDate = moment().endOf('year');
        break;
      }
      case 'Monthly': {
        this.startDate = moment().startOf('year');
        this.endDate = moment().endOf('year');
        break;
      }
      case 'Daily': {
        this.startDate = moment().startOf('month');
        this.endDate = moment().endOf('month');
        break;
      }
    }
    console.log(`New range: start(${this.startDate.format('YYYY-MM-DD')}), end(${this.endDate.format('YYYY-MM-DD')})`);
  }

  /**
   * Updates start/end date upon navigating previous/next period.
   * @param {string} - interval label
   * @param {number} - navigation direction, -1(previous) or 1(next)
   */
  updateDatesByPeriod(interval:string, direction:number) {
    switch (interval) {
      // case 'Yearly' is missing as we disable prev/next button
      case 'Monthly': {
        if (direction < 0) {
          this.startDate = this.startDate.subtract(1, 'years');
        } else {
          this.startDate = this.startDate.add(1, 'years');          
        }
        this.endDate = moment(this.startDate).endOf('year');
        break;
      }
      case 'Daily': {
        if (direction < 0) {
          this.startDate = this.startDate.subtract(1, 'months');
        } else {
          this.startDate = this.startDate.add(1, 'months');          
        }
        this.endDate = moment(this.startDate).endOf('month');
        break;
      }
      default: {
        break;
      }
    }
    console.log(`New range: start(${this.startDate.format('YYYY-MM-DD')}), end(${this.endDate.format('YYYY-MM-DD')})`);
  }

  /**
   * @returns {boolean} - should disable 'previous' button.
   */
  isPrevButtonDisabled():boolean {
    if (this.intervalSelection.value === 'Yearly') {
      return true;
    }
    return false;
  }

  /**
   * @returns {boolean} - should disable 'next' button.
   */
  isNextButtonDisabled():boolean {
    if (this.intervalSelection.value === 'Monthly') {
      return this.startDate.isSame(moment().startOf('year'));
    }
    if (this.intervalSelection.value === 'Daily') {
      return this.startDate.isSame(moment().startOf('month'));
    }    
    return (this.intervalSelection.value === 'Yearly');
  }

  /**
   * @param {string} - interval label
   * @returns {string} - X-axis title based on interval.
   */
  getChartLabel(label: string):string {
    switch (label) {
      case 'Yearly': {
        return 'Year';
      }
      case 'Monthly': {
        return this.startDate.format('YYYY');
      }
      case 'Daily': {
        return this.startDate.format('MMM YYYY');
      }
    }
    return 'N/A';
  }

  /**
   * @param {string} - selected interval label.
   */
  private _getMetricData(intervalLabel) {
    let metricInfo = this.intervalList.find(element => element.label === intervalLabel);
    this._dataApi.genericMethod('Metric', 'findMetricDataByName', [[metricInfo.amountMetricName, metricInfo.countMetricName],
      { metricDate: { between: [this.startDate.toDate(), this.endDate.toDate()] } }
    ])
      .pipe(take(1))
      .subscribe(data => {
        this._updateChart(data, intervalLabel);
      });
  }

  /**
   * @param {Object[]} - metric data array
   * @param {string} - selected interval label
   * @returns {Object[]} - chart data array.
   */
  private _formatChartData(dataArray:any[], intervalLabel:string):any[] {
    if (dataArray.length === 0) {
      return [
        [this.getChartLabel(intervalLabel), 'Total Amount', 'Order Count'],
        ['', 0, 0]
      ];
    }

    const intervalInfo = this.intervalList.find((element) => element.label === intervalLabel);
    let tableHeader = [[this.getChartLabel(intervalLabel), 'Total Amount', 'Order Count']];  // header
    const grouped = groupBy(dataArray, 'metricDate');
    let dateKeys = keys(grouped);
    dateKeys.sort();

    // build data table.
    let newData = dateKeys.map((dateKey) => {
      let dataArray = grouped[dateKey];
      const hAxis = moment(dateKey).format(intervalInfo.format);
      const amount = dataArray.find(function(element) {
        return element.metricId === intervalInfo.amountMetricName;
      })
      const count = dataArray.find(function(element) {
        return element.metricId === intervalInfo.countMetricName;
      })
      return [hAxis, Number(amount.value), Number(count.value)];
    })
    return tableHeader.concat(newData); 
  }

  /**
   * @param {Object[]} - metric data array
   * @param {string} - selected interval label
   */
   private _updateChart(dataArray, intervalLabel) {
    let newDataTable = this._formatChartData(dataArray, intervalLabel);
    // update chart
    if (this.orderChart) {
      this.orderChart.options['hAxis'].title = this.getChartLabel(intervalLabel);
      this.orderChart.dataTable = newDataTable;
      this.orderChart.component.draw();
    } else {
      // assume 'Daily' interval
      this._initializeOrderChart(newDataTable, this.startDate.format('MMM YYYY')); 
    }
  }

  /**
   * @param {Object[]} - chart data table.
   */
  private _initializeOrderChart(dataTable, hAxisTitle) {
    this.orderChart = {
      chartType: 'ComboChart',
      dataTable: dataTable,
      options: {
        title: 'Total Orders Over Time',
        min: 0,
        height: 400,
        vAxes: {
          0: { title: 'Amount', format:'$#,###.##' },
          1: { title: 'Order Count'}
        },
        hAxis: { title: hAxisTitle },
        series: {
          0: {
            type: 'bars',
            targetAxisIndex: 0
          },
          1: {
            type: 'line',
            targetAxisIndex: 1
          }
        }
      }
    };
  }
}
