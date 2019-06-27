import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatSnackBar } from '@angular/material';

import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { StatementDetailComponent } from './statement-detail.component';
import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

describe('StatementDetailComponent', () => {
  let component: StatementDetailComponent;
  let fixture: ComponentFixture<StatementDetailComponent>;

  beforeEach(async(() => {
    const testStatement = {
      id: '1000',
      statementDate: '1/1/2019',
      totalAmount: '1000.00',
      note: '',
      order: []
    };
    const route = ({ data: of({ statement: testStatement} ), snapshot: {} } as any) as ActivatedRoute;

    TestBed.configureTestingModule({
      declarations: [ StatementDetailComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back', 'path']) },
        { provide: MatDialog, useValue: { open: () => {} } },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
