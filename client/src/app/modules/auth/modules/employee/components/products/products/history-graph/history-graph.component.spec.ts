import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../../shared/auth-shared.module';
import { HistoryGraphComponent } from './history-graph.component';
import { DataApiService } from '../../../../services/data-api.service';

@Component({
  selector: "host-component",
  template: `<app-history-graph metricName="test"></app-history-graph>`
})
class TestHostComponent {
  @ViewChild(HistoryGraphComponent) myComponent: HistoryGraphComponent;
}

describe('HistoryGraphComponent', () => {
  let component: HistoryGraphComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryGraphComponent, TestHostComponent ],
      imports: [ AuthSharedModule, NoopAnimationsModule ],
      providers: [
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.myComponent;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of(null));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
