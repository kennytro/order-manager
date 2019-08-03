import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { RankGraphComponent } from './rank-graph.component';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: "host-component",
  template: `<app-rank-graph metricName="test"></app-rank-graph>`
})
class TestHostComponent {
  @ViewChild(RankGraphComponent) myComponent: RankGraphComponent;
}

describe('RankGraphComponent', () => {
  let component: RankGraphComponent;
  let fixture: ComponentFixture<RankGraphComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RankGraphComponent, TestHostComponent ],
      imports: [ AuthSharedModule, NoopAnimationsModule ],
      providers: [
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]      
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RankGraphComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of(null));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
