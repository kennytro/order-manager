import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { NewUserComponent } from './new-user.component';
import { DataApiService } from '../../../services/data-api.service';

describe('NewUserComponent', () => {
  let component: NewUserComponent;
  let fixture: ComponentFixture<NewUserComponent>;
  let snackbarSpy: jasmine.SpyObj<MatSnackBar>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  beforeEach(async(() => {
    const dlgSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const msbSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dataSpy = jasmine.createSpyObj('DataApiService', ['find', 'upsert']);
    TestBed.configureTestingModule({
      declarations: [ NewUserComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: dlgSpy },
        FormBuilder,
        { provide: MatSnackBar, useValue: msbSpy },
        { provide: DataApiService, useValue: dataSpy },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserComponent);
    component = fixture.componentInstance;
    snackbarSpy = TestBed.get(MatSnackBar);
    apiSpy = TestBed.get(DataApiService);
    apiSpy.find.and.returnValue(of([{id: 'test1', name: 'testClient'}]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
