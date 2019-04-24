import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface DialogData {
  amount: number,
  reason: string
}

@Component({
  selector: 'app-edit-adjust',
  templateUrl: './edit-adjust.component.html',
  styleUrls: ['./edit-adjust.component.css']
})
export class EditAdjustComponent implements OnInit {
  adjustFG: FormGroup;

  constructor(
    private _dialogRef: MatDialogRef<EditAdjustComponent>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { 
  }

  ngOnInit() {
    this.adjustFG = this._formBuilder.group({
      amount: [this.data.amount, Validators.required],
      reason: [this.data.reason, Validators.required]
    });
  }

  save() {
    this._dialogRef.close(this.adjustFG.value);
  }
}
