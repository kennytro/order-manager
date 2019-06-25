import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTags } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { NewOrderComponent } from './new-order.component';
import { DataApiService } from '../../../services/data-api.service';

describe('NewOrderComponent', () => {
  const testClients = [
    { id: '1000', name: 'test' },
    { id: '1001', name: 'test1' }
  ];
  const testProducts = [
    { id: '2000', name: 'Grape', description: 'grape', category: 'fruit', unitPrice: '10.00', unit: 'lb' },
    { id: '2001', name: 'Coke', description: 'Coca cola', category: 'beverage', unitPrice: '20.00', unit: 'case' }
  ];
  let component: NewOrderComponent;
  let fixture: ComponentFixture<NewOrderComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  library.add(faTags);
  
  beforeEach(async(() => {
    const route = ({ data: of({ clients: testClients} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ NewOrderComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod', 'find']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOrderComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.find.and.returnValue(of(testProducts));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
