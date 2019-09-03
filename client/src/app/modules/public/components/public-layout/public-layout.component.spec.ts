import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMobile, faSignInAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { PublicLayoutComponent } from './public-layout.component';
import { AWS_S3_PUBLIC_URL } from '../../../../shared/base.url';
import { RootScopeShareService } from '../../../../services/root-scope-share.service';

describe('PublicLayoutComponent', () => {
  let component: PublicLayoutComponent;
  let fixture: ComponentFixture<PublicLayoutComponent>;
  let shareSvcSpy: jasmine.SpyObj<RootScopeShareService>;
  library.add(faMobile, faSignInAlt, faInfoCircle);
  beforeEach(async(() => {
    const shareSpy = jasmine.createSpyObj('RootScopeShareService', ['getData']);
    TestBed.configureTestingModule({
      declarations: [ PublicLayoutComponent ],
      imports: [FontAwesomeModule, RouterTestingModule],
      providers: [
        { provide: RootScopeShareService, useValue: shareSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    shareSvcSpy = TestBed.get(RootScopeShareService);
    shareSvcSpy.getData.and.returnValue({id: 'om-app-dev'});
    fixture = TestBed.createComponent(PublicLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get compnay logo', () => {
    expect(component.getCompanyLogo()).toEqual(AWS_S3_PUBLIC_URL + 'om-app-dev/favicon.png');
  })
});
