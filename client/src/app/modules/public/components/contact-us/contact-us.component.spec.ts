import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';

import { PublicModule } from '../../public.module';
import { ContactUsComponent } from './contact-us.component';
import { MessageService } from '../../services/message.service';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { RootScopeShareService } from '../../../../services/root-scope-share.service';

describe('ContactUsComponent', () => {
  const testTenant = { reCAPTCHASiteKey: 'testkey' };
  let component: ContactUsComponent;
  let fixture: ComponentFixture<ContactUsComponent>;
  let apiSpy: jasmine.SpyObj<RootScopeShareService>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        PublicModule,
        RecaptchaModule, RecaptchaFormsModule
      ],
      providers: [
        FormBuilder,
        MatSnackBar,
        MessageService,
        { provide: RootScopeShareService, useValue: jasmine.createSpyObj('RootScopeShareService', ['getData']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUsComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(RootScopeShareService);
    apiSpy.getData.and.returnValue(testTenant);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  /*
  it('should submit', () => {
    // TO DO: test submit action.
  })
  */
});
