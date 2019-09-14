import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import * as moment from 'moment';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { TotalOrdersComponent } from './total-orders.component';
import { DataApiService } from '../../../services/data-api.service';
import { SocketService } from '../../../../../shared/services/socket.service';

describe('TotalOrdersComponent', () => {
  let component: TotalOrdersComponent;
  let fixture: ComponentFixture<TotalOrdersComponent>;
  let cookieSpy: jasmine.SpyObj<CookieService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let socketSpy: jasmine.SpyObj<SocketService>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalOrdersComponent ],
      imports: [ AuthSharedModule, NoopAnimationsModule ],
      providers: [
        { provide: CookieService, useValue: jasmine.createSpyObj('CookieService', ['get']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: SocketService, useValue: jasmine.createSpyObj('SocketService', ['initSocket', 'onModel']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalOrdersComponent);
    component = fixture.componentInstance;
    cookieSpy = TestBed.get(CookieService);
    cookieSpy.get.and.returnValue('1000');
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of([]));
    socketSpy = TestBed.get(SocketService);
    socketSpy.onModel.and.returnValue(of({operation: 'save', metricNames: ['test']}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should udpate dates by interval', () => {
    component.updateDatesByInterval('Daily');
    expect(component.startDate).toEqual(moment().startOf('month'), 'updates start date to start of current month');
    expect(component.endDate).toEqual(moment().endOf('month'), 'updates end date to end of current month');

    component.updateDatesByInterval('Monthly');
    expect(component.startDate).toEqual(moment().startOf('year'), 'updates start date to start of current year');
    expect(component.endDate).toEqual(moment().endOf('year'), 'updates end date to end of current year');

    component.updateDatesByInterval('Yearly');
    expect(component.startDate).toEqual(moment('2000-01-01'), 'updates start date to 2000/01/01');
    expect(component.endDate).toEqual(moment().endOf('year'), 'updates end date to end of current year');
  });

  it('should udpate dates by period', () => {
    let curStartDate = moment(component.startDate);
    let curEndDate = moment(component.endDate);
    component.updateDatesByPeriod('Daily', -1);
    curStartDate.subtract(1, 'months');
    curEndDate = moment(curStartDate).endOf('month');
    expect(component.startDate).toEqual(curStartDate, 'updates start date to previous month.');
    expect(component.endDate).toEqual(curEndDate, 'updates end date to previous month.');

    component.updateDatesByPeriod('Daily', 1);
    curStartDate.add(1, 'months');
    curEndDate = moment(curStartDate).endOf('month');
    expect(component.startDate).toEqual(curStartDate, 'updates start date to next month');
    expect(component.endDate).toEqual(curEndDate, 'updates end date to next month');

    component.updateDatesByPeriod('Monthly', -1);
    curStartDate.subtract(1, 'years');
    curEndDate = moment(curStartDate).endOf('year');
    expect(component.startDate).toEqual(curStartDate, 'updates start date to previous year.');
    expect(component.endDate).toEqual(curEndDate, 'updates end date to previous year.');

    component.updateDatesByPeriod('Monthly', 1);
    curStartDate.add(1, 'years');
    curEndDate = moment(curStartDate).endOf('year');
    expect(component.startDate).toEqual(curStartDate, 'updates start date to next year');
    expect(component.endDate).toEqual(curEndDate, 'updates end date to next year');
  });

  it('should disable prev/next button', () => {
    expect(component.isPrevButtonDisabled()).toEqual(false, 'prev button should be enabled by default');
    expect(component.isNextButtonDisabled()).toEqual(true, 'next button should be disabled by default');

    // due to google chart issue("Cannot read property 'setDataTable' of undefined thrown"), we disable change event.
    component.intervalSelection.setValue('Monthly', { emitEvent: false });
    component.updateDatesByInterval('Monthly');
    expect(component.isPrevButtonDisabled()).toEqual(false, 'prev button should be enabled with monthly interval');
    expect(component.isNextButtonDisabled()).toEqual(true, 'next button should be disabled in current year');

    component.updateDatesByPeriod('Monthly', -1);
    expect(component.isPrevButtonDisabled()).toEqual(false, 'prev button should be enabled with monthly interval');
    expect(component.isNextButtonDisabled()).toEqual(false, 'next button should be enabled in previous year');

    // due to google chart issue("Cannot read property 'setDataTable' of undefined thrown"), we disable change event.
    component.intervalSelection.setValue('Yearly', { emitEvent: false });
    component.updateDatesByInterval('Yearly');
    expect(component.isPrevButtonDisabled()).toEqual(true, 'prev button should be disabled with yearly interval');
    expect(component.isNextButtonDisabled()).toEqual(true, 'next button should be disabled with yearly interval');
  });
});
