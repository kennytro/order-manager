import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

import { RootScopeShareService } from './services/root-scope-share.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    const dsSpy = jasmine.createSpyObj('RootScopeShareService', ['getData']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: RootScopeShareService, useValue: dsSpy }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    spyOn(document, 'getElementById').and.callFake(function() {
      return {
        setAttribute: function(a, b) {}
      };
    });
    const dsSpy = TestBed.get(RootScopeShareService);
    dsSpy.getData.and.returnValue({id: 'test'});

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
    expect(dsSpy.getData.calls.count()).toBe(1, 'spy method was called once');
  });
});
