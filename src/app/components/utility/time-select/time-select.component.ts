import { Component, Input, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';
import { Time } from '@angular/common';
import * as convertTime from "convert-time";

@Component({
  selector: 'app-time-select',
  templateUrl: './time-select.component.html',
  styleUrls: ['./time-select.component.css']
})
export class TimeSelectComponent implements AfterViewInit {

  @Input() disabled: boolean;
  @Input() control: FormControl;
  @Input() timeIncrement: number = 30;

  @ViewChild("time", {static: true}) timePicker: NgxTimepickerFieldComponent;

  ngAfterViewInit() {
    this.timePicker.registerOnChange((value: string) => {
      let incremented = this.changeByIncrement(this.control.value, convertTime(value));
      this.control.setValue(this.timeToString(incremented));
      if (this.timePicker.minute != incremented.minutes) {
        this.timePicker.changeMinute(incremented.minutes);
      }
    });
  }

  public setTime(time: Time) {
    // this.timePicker.hour = time.hours;
    // this.timePicker.minute = time.minutes;
    this.timePicker.changeHour(time.hours);
    this.timePicker.changeMinute(time.minutes);
  }

  private changeByIncrement(original: string, changed: string): Time {
    original = original ? original : "00:00"
    let o = this.buildTimeFromString(original);
    let c = this.buildTimeFromString(changed);
    if (o.minutes == c.minutes) {
      c.minutes = o.minutes;
      return c;
    } else if (o.minutes - c.minutes < 0) {
      c.minutes = o.minutes + this.timeIncrement;
    } else {
      c.minutes = o.minutes - this.timeIncrement;
    }
    c.minutes = c.minutes % 60;
    return c;
  }

  private buildTimeFromString(time: string): Time {
    let split = time.split(":").map(m => Number.parseInt(m));
    return {
      hours: split[0],
      minutes: split[1]
    } as Time;
  }

  private timeToString(time: Time): string {
    return `${time.hours}:${time.minutes}`;
  }



  constructor() { }

}
