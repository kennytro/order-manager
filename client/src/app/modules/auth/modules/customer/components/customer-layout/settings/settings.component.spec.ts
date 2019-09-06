import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { SharedModule } from '../../../../../../../shared/shared.module';
import { SettingsComponent } from './settings.component';

import { DataApiService } from '../../../services/data-api.service';

describe('SettingsComponent', () => {
  const testClient = { 
    id: '1000',
    showPublic: false,
    name: 'testA',
    phone: '1111111111',
    email: 'test@etr.com'
 };

  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, SharedModule ],
      providers: [
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        FormBuilder,
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: { client: testClient } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    TestBed.get(DataApiService).genericMethod.and.returnValue(of(testClient));
    TestBed.get(MatSnackBar).open.and.returnValue(true);
    TestBed.get(MatDialogRef).close.and.returnValue(testClient);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
