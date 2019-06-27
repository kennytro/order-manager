import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import { of } from 'rxjs';

import { TextMaskModule } from 'angular2-text-mask';
import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { SettingsComponent } from './settings.component';
import { DataApiService } from '../../../services/data-api.service';

describe('SettingsComponent', () => {
  const testSettings = {
    name: 'test',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZip: '98765',
    phone: '',
    email: ''
  };
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  library.add(faCog);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule, TextMaskModule],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        FormBuilder,
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of(testSettings));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
