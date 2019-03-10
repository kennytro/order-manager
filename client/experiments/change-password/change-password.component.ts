import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core'
import { NgForm, FormBuilder, FormGroup, FormControl, FormGroupDirective, Validators } from '@angular/forms';

class ConfirmPasswordErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);
    const passwordDirty = !!(control && control.parent && control.parent.get('password').dirty);
    return passwordDirty && (invalidCtrl || invalidParent);
  }
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  passwordChangeFG: FormGroup;
  matcher = new ConfirmPasswordErrorMatcher();
  constructor(
    private _dialogRef: MatDialogRef<ChangePasswordComponent>,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.passwordChangeFG = this._formBuilder.group({
      password: ['', [
        Validators.required,
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,}')
        ]],
      confirmPassword: ['']
    }, { validator: this._passwordMatchValidator });
  }

  getPasswordError() {
    let passwordFC = this.passwordChangeFG.get('password');
    if (passwordFC.hasError('required')) {
      return 'Empty password is not allowed';
    }
    if (passwordFC.hasError('pattern')) {
      if (passwordFC.value.length < 8) {
        return 'Password must be at least 8 characters in length';
      }
      if (!passwordFC.value.match('[a-z]')) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!passwordFC.value.match('[A-Z]')) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!passwordFC.value.match('[0-9]')) {
        return 'Password must contain at least one number';
      }
      return 'Password must contain at least one special character in "!@#$%^&"';
    }
    return null;
  }

  change() {
    this._dialogRef.close({ password: this.passwordChangeFG.value.password});
  }

  private _passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : {'mismatch': true};
  }

}
