import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  new?: boolean
}

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.css']
})
export class MessageDetailComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

}
