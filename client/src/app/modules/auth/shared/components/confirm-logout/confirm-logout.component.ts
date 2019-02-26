import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-logout',
  templateUrl: './confirm-logout.component.html',
  styleUrls: ['./confirm-logout.component.css']
})
export class ConfirmLogoutComponent {
  constructor(private _dialogRef: MatDialogRef<ConfirmLogoutComponent>) { }
}
