import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { TextMaskModule } from 'angular2-text-mask';
import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { NewClientComponent } from './new-client.component';
import { DataApiService } from '../../../services/data-api.service';

describe('NewClientComponent', () => {
  const testRoutes = [
    { id: '1000', description: 'test Route', driverName: 'Test Driver', driverPhone: '1111111111' }
  ];
  let component: NewClientComponent;
  let fixture: ComponentFixture<NewClientComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewClientComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, TextMaskModule],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        FormBuilder,
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['find', 'upsert']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewClientComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.find.and.returnValue(of(testRoutes));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
