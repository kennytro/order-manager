import { Injectable } from '@angular/core';

import swal from 'sweetalert2';

@Injectable()
export class AlertService {

  constructor() { }

  public alertSuccess(alertTitle: string, alertText: string, successCb?: any) {
    swal.fire({
      title: alertTitle,
      html: alertText,
      type: 'success'
    }).then((result: any) => {
      if (result.value) {
        if (successCb) {
          successCb();
        }
      }
    });
  }

  public confirm(alertTitle: string, alertText: string, successCb: any, cancelCb?: any) {
    swal.fire({
      title: alertTitle,
      text: alertText,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      // customClass: 'sweet-warning2'
    }).then((result: any) => {
      if (result.value) {
        successCb();
      }
      else if (result.dissmiss) {
        if (cancelCb) {
          cancelCb();
        }
      }
    });
  }

  public close() {
      swal.close();
  }
}
