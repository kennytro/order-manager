import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicModule } from '../../public.module';
import { ActivatedRoute, Data } from '@angular/router';
import { ProductComponent } from './product.component';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ PublicModule ],
      providers: [
        { provide: ActivatedRoute, useValue: {
          data: {
            subscribe: (fn: (value: Data) => void) => fn({
              content: '<p>test</p>'
            })
          }
        } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get content', () => {
    expect(component.getContent()).toEqual('<p>test</p>');
  })
});
