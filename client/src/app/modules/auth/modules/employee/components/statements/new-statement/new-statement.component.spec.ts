import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLongArrowAltRight, faStoreAlt, faShoppingCart, faSearchDollar } from '@fortawesome/free-solid-svg-icons';

import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { NewStatementComponent } from './new-statement.component';
import { DataApiService } from '../../../services/data-api.service';
describe('NewStatementComponent', () => {
  let component: NewStatementComponent;
  let fixture: ComponentFixture<NewStatementComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  library.add(faLongArrowAltRight, faStoreAlt, faShoppingCart, faSearchDollar);

  beforeEach(async(() => {
    const route = ({ data: of({ clients: [{id: '111', name: 'testClient' }] }), snapshot: {} } as any) as ActivatedRoute;

    TestBed.configureTestingModule({
      declarations: [ NewStatementComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatDialog, useValue: { open: () => {} } },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStatementComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of([]));    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
