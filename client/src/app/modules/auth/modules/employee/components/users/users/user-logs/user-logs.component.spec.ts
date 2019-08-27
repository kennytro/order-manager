import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../../shared/auth-shared.module';
import { UserLogsComponent } from './user-logs.component';
import { DataApiService } from '../../../../services/data-api.service';

@Component({
  selector: "host-component",
  template: `<app-user-logs></app-user-logs>`
})
class TestHostComponent {
  @ViewChild(UserLogsComponent) myComponent: UserLogsComponent;
}

describe('UserLogsComponent', () => {
  let component: UserLogsComponent;
  let fixture: ComponentFixture<UserLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserLogsComponent, TestHostComponent ],
      imports: [ AuthSharedModule, NoopAnimationsModule ],
      providers: [
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLogsComponent);
    component = fixture.componentInstance;
    // apiSpy = TestBed.get(DataApiService);
    // apiSpy.genericMethod.and.returnValue(of([]]));    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
