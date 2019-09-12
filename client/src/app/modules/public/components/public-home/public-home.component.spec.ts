import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicModule } from '../../public.module';
import { ActivatedRoute, Data } from '@angular/router';
import { PublicHomeComponent } from './public-home.component';

describe('PublicHomeComponent', () => {
  let component: PublicHomeComponent;
  let fixture: ComponentFixture<PublicHomeComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, PublicModule ],
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
    fixture = TestBed.createComponent(PublicHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get content', () => {
    expect(component.getContent()).toEqual('<p>test</p>');
  });
});
