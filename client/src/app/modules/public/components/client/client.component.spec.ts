import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicModule } from '../../public.module';
import { ActivatedRoute, Data } from '@angular/router';
import { ClientComponent } from './client.component';

describe('ClientComponent', () => {
  let component: ClientComponent;
  let fixture: ComponentFixture<ClientComponent>;

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
    fixture = TestBed.createComponent(ClientComponent);
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
