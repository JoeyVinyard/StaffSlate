import { Component, Input, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';
import { Time } from '@angular/common';
import { ClockFaceTime } from 'ngx-material-timepicker/src/app/material-timepicker/models/clock-face-time.interface';

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

  lastMinute: number;
  am: boolean = true;

  ngAfterViewInit() {
    this.timePicker.minute$.subscribe((cft: ClockFaceTime) => {
      if(this.lastMinute == null) {
        this.lastMinute = cft.time;
      }
      if(this.lastMinute != cft.time) {
        let newMinute = this.increment(cft.time);
        this.lastMinute = newMinute;
        this.timePicker.changeMinute(newMinute);
        this.control.setValue({
          hours: this.control.value.hours,
          minutes: newMinute || 0
        });
      }
    });
    this.timePicker.hour$.subscribe((cft: ClockFaceTime) => {
      this.control.setValue({
        hours: this.convertHours(cft.time),
        minutes: this.control.value.minutes || 0
      });
    });
    this.timePicker.period$.subscribe((tp) => {
      this.am = tp == "AM";
      this.control.setValue({
        hours: this.convertHours(this.control.value.hours),
        minutes: this.control.value.minutes || 0
      });
    });
  }

  public setTime(time: Time) {
    this.timePicker.changeHour(time.hours);
    this.timePicker.changeMinute(time.minutes);
  }

  //Converts a 12h time format to 24h
  private convertHours(h: number): number {
    if(this.am){
      if(h == 12) {
        return 0;
      }
      return h;
    } else {
      if(h == 12) {
        return h;
      } else {
        return h+12;
      }
    }
  }

  private increment(newMinutes: number): number {
    if (this.lastMinute == newMinutes) {
      newMinutes = this.lastMinute;
      return newMinutes;
    } else if (this.lastMinute - newMinutes < 0) {
      newMinutes = this.lastMinute + this.timeIncrement;
    } else {
      newMinutes = this.lastMinute - this.timeIncrement;
    }
    newMinutes = newMinutes % 60;
    return newMinutes;
  }

  constructor() { }

}
