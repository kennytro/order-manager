import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthSharedModule } from '../../../../shared/auth-shared.module';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';

import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-todays-snapshots',
  template: '<p>Mock Snapshots Component</p>'
})
class FakeTodaysSnapshotsComponent {};
@Component({
  selector: 'app-total-orders',
  template: '<p>Mock Orders Component</p>'
})
class FakeTotalOrdersComponent {};

@Component({
  selector: 'app-rank-graph',
  template: '<p>Mock Rank Graph Component</p>'
})
class FakeRankGraphComponent {
  @Input() instanceId: string;
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent, FakeTodaysSnapshotsComponent, FakeTotalOrdersComponent, FakeRankGraphComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule ],
      providers: [
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of(null));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
