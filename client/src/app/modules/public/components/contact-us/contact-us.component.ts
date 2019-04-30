import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
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
    // this.route.data.subscribe(routeData => {
    //   let content = routeData['content'];
    //   if (content) {
    //     this._content = content;
    //   }
    // });
  }

  submit() {
    const snackBarRef = this._snackBar.open(`Thank you for contacting us!`,
      'Close', { duration: 3000 });
    snackBarRef.onAction().subscribe(() => {
      snackBarRef.dismiss();
    });
  }
  // getContent() {
  //   return this._content;
  // }
}
