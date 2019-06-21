import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  contactFG: FormGroup;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(
    private _formBuilder: FormBuilder, 
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.contactFG = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      note: ['']
    });
  }

  submit() {
    // TO DO: implement data submission
    const snackBarRef = this._snackBar.open(`Thank you for contacting us!`,
      'Close', { duration: 3000 });
    snackBarRef.onAction().subscribe(() => {
      snackBarRef.dismiss();
    });
  }
}
