import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import * as moment from 'moment';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { TodaysSnapshotsComponent } from './todays-snapshots.component';
import { DataApiService } from '../../../services/data-api.service';
import { SocketService } from '../../../../../shared/services/socket.service';

describe('TodaysSnapshotsComponent', () => {
  const today = moment().format('MM/DD/YYYY');
  const testOrders = [
    { id: '1000', client: { id: '1100', name: 'test' }, status: 'Submitted', totalAmount: '100.01', note: '', createdAt: today },
    { id: '1001', client: { id: '1101', name: 'test1' }, status: 'Processed', totalAmount: '100.01', note: '', createdAt: today },
    { id: '1002', client: { id: '1102', name: 'test2' }, status: 'Shipped', totalAmount: '100.01', note: '', createdAt: today }
  ];
  let component: TodaysSnapshotsComponent;
  let fixture: ComponentFixture<TodaysSnapshotsComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let socketSpy: jasmine.SpyObj<SocketService>;  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodaysSnapshotsComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule ],
      providers: [
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['find']) },
        { provide: SocketService, useValue: jasmine.createSpyObj('SocketService', ['initSocket', 'onModel']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaysSnapshotsComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.find.and.returnValue(of(testOrders));
    socketSpy = TestBed.get(SocketService);
    socketSpy.onModel.and.returnValue(of({}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
