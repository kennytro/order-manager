import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileInvoice, faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../../shared/auth-shared.module';
import { ShoppingListComponent } from './shopping-list.component';
import { DataApiService } from '../../../../services/data-api.service';
import { PdfService } from '../../../../services/pdf.service';

describe('ShoppingListComponent', () => {
  const testOrders = [
    {
      id: '1000',
      status: 'Submitted',
      client: { id: '1000', name: 'test' },
      orderItem: [{
        productId: '4000',
        quantity: '10',
        product: {
          id: '4000',
          name: 'grape',
          description: 'Green grape',
          category: 'fruit',
          unit: 'lb',
          settings: {}
        }
      }]
    }
  ];
  let component: ShoppingListComponent;
  let fixture: ComponentFixture<ShoppingListComponent>;
  library.add(faFileInvoice, faArrowAltCircleDown);

  beforeEach(async(() => {
    const route = ({ data: of({ orders: testOrders } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ ShoppingListComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: PdfService, useValue: jasmine.createSpyObj('PdfService', ['downloadPDF']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // TO DO: test moveOrdersToProcessed()
});
