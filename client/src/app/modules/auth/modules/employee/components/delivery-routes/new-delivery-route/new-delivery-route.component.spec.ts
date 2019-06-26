import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';

import { TextMaskModule } from 'angular2-text-mask';
import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { NewDeliveryRouteComponent } from './new-delivery-route.component';
import { DataApiService } from '../../../services/data-api.service';
describe('NewDeliveryRouteComponent', () => {
  let component: NewDeliveryRouteComponent;
  let fixture: ComponentFixture<NewDeliveryRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDeliveryRouteComponent ],
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
    fixture = TestBed.createComponent(NewDeliveryRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
