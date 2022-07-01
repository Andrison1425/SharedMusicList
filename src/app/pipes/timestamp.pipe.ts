import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp'
})
export class TimestampPipe implements PipeTransform {

  constructor(
    private datePipe: DatePipe
  ) {}

  transform(value: {
    seconds: number,
    nanoseconds: number
  }): string {

    const date = new Date(value.seconds * 1000);
    const formatedByDatePipe = this.datePipe.transform(date, 'shortTime');
    const compareDate = new Date();

    if (date.toLocaleDateString() === compareDate.toLocaleDateString()) {
      return formatedByDatePipe;
    } else {
      return date.toLocaleDateString();
    }
  }

}
