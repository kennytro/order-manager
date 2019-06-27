import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../../shared/auth-shared.module';
import { PackageDistributionComponent } from './package-distribution.component';
import { DataApiService } from '../../../../services/data-api.service';
import { PdfService } from '../../../../services/pdf.service';

describe('PackageDistributionComponent', () => {
  const testOrders = [
    {
      id: '1000',
      status: 'Processed',
      client: { id: '1000', name: 'test', deliveryRouteId: 'testRoute' },
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
  let component: PackageDistributionComponent;
  let fixture: ComponentFixture<PackageDistributionComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ orders: testOrders } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ PackageDistributionComponent ],
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
    fixture = TestBed.createComponent(PackageDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // TO DO: test moveOrdersToShipped()
});
