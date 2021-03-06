import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthSharedModule } from '../../../../shared/auth-shared.module';

import { DashboardComponent } from './dashboard.component';

@Component({
  selector: 'app-todays-snapshots',
  template: '<p>Mock Snapshots Component</p>'
})
class FakeTodaysSnapshotsComponent { };

@Component({
  selector: 'app-total-orders',
  template: '<p>Mock Orders Component</p>'
})
class FakeTotalOrdersComponent { };

@Component({
  selector: 'app-rank-graph',
  template: '<p>Mock Rank Graph Component</p>'
})
class FakeRankGraphComponent { };

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent, FakeTodaysSnapshotsComponent, FakeTotalOrdersComponent, FakeRankGraphComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
