import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysSnapshotsComponent } from './todays-snapshots.component';

describe('TodaysSnapshotsComponent', () => {
  let component: TodaysSnapshotsComponent;
  let fixture: ComponentFixture<TodaysSnapshotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodaysSnapshotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaysSnapshotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
