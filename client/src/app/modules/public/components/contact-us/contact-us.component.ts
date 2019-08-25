import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RootScopeShareService } from '../../../../services/root-scope-share.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  contactFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  captchaSiteKey: string;
  submitted: boolean;
  private _captchaResponse: string;
  constructor(
    private _dataShare: RootScopeShareService,
    private _message: MessageService,
    private _formBuilder: FormBuilder, 
    private _snackBar: MatSnackBar
  ) {
    this.submitted = false;
  }

  ngOnInit() {
    const tenant = this._dataShare.getData('tenant');
    this.captchaSiteKey = tenant.reCAPTCHASiteKey;
    this.contactFG = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      note: [''],
      reCAPTCHA: [null, Validators.required]
    });
  }

  reCAPTCHAresolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
    this._captchaResponse = captchaResponse;
  }

  submit() {
    // TO DO: implement data submission
    if (this._captchaResponse) {
      let userInput = this.contactFG.value;
      delete userInput.reCAPTCHA;
      this._message.submitInquiry(this._captchaResponse, userInput)
        .subscribe(response => {
          if (response.success) {
            this.submitted = true;
            console.debug(`Inquiry submitted at ${response.postTime}`);
            const snackBarRef = this._snackBar.open(`Thank you for contacting us!`,
              'Close', { duration: 3000 });
            snackBarRef.onAction().subscribe(() => {
              snackBarRef.dismiss();
            });
          } else {
            const snackBarRef = this._snackBar.open(`We could not submit your inquiry - ${response.errorMessage} We are very sorry for the inconvenience.`, 'Close');
            snackBarRef.onAction().subscribe(() => {
              snackBarRef.dismiss();
            });
          }
        });
    }
  }
}
