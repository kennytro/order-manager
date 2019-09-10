import { TestBed, async } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';

import { RootScopeShareService } from './services/root-scope-share.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    const dsSpy = jasmine.createSpyObj('RootScopeShareService', ['getData']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, MatProgressSpinnerModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['events']) },
        { provide: RootScopeShareService, useValue: dsSpy }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    spyOn(document, 'getElementById').and.callFake(function() {
      return <HTMLElement>{
        setAttribute: function(a, b) {}
      };
    });
    const dsSpy = TestBed.get(RootScopeShareService);
    dsSpy.getData.and.returnValue({id: 'om-app-dev'});

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
    expect(dsSpy.getData.calls.count()).toBe(1, 'spy method was called once');
  });
});
