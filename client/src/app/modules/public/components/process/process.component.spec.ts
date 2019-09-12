import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicModule } from '../../public.module';
import { ActivatedRoute, Data } from '@angular/router';
import { ProcessComponent } from './process.component';

describe('ProcessComponent', () => {
  let component: ProcessComponent;
  let fixture: ComponentFixture<ProcessComponent>;

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
    fixture = TestBed.createComponent(ProcessComponent);
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
