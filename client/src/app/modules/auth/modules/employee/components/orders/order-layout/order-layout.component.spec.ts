import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { OrderLayoutComponent } from './order-layout.component';

describe('OrderLayoutComponent', () => {
  let component: OrderLayoutComponent;
  let fixture: ComponentFixture<OrderLayoutComponent>;
  library.add(faCartPlus);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderLayoutComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
