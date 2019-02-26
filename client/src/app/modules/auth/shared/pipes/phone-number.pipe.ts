import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const numbers: any = ('' + value).replace(/\D/g, '');
      let matchString = /^(\d{3})(\d{3})(\d{4})$/;
      if (numbers && numbers[0] === '1') {
        matchString = /^1(\d{3})(\d{3})(\d{4})$/;
      }
      const numArray: any = numbers.match(matchString);
      return (!numArray) ? undefined : '(' + numArray[1] + ') ' + numArray[2] + ' ' + numArray[3];
  }
}
