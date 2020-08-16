import { Injectable } from '@angular/core';
import { Time } from '@angular/common';
import { Coverage } from '../models/coverage';
import { Sheet } from '../models/sheet';
import { Shift } from '../models/shift';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  public getTimeIndex(time: Time, start: Time, increment: number): number {
    return (time.hours - start.hours)*(60/increment)+(time.minutes-start.minutes)/increment;
  }
  public timeToString(time: Time, space: boolean = true): string {
    return `${time.hours == 12 || time.hours == 0 ? "12" : time.hours%12}:${time.minutes < 10 ? "0" + time.minutes : time.minutes}${space ? " " : ""}${time.hours>=12 ? "PM" : "AM"}`;
  }
  public timeTo24HrString(time: Time): string {
    return `${time.hours}:${time.minutes < 10 ? "0" + time.minutes : time.minutes}`
  }
  public timeToNum(time: Time): number {
    return time.hours*100 + time.minutes;
  }
  public generateTimeColumns(start: Time, end: Time, increment: number, excludeEnd: boolean = false): Time[] {
    let times: Time[] = []
    let t = this.makeTime(start.hours, start.minutes);
    while(this.timeToNum(t) < this.timeToNum(end) || (!excludeEnd && this.timeToNum(t) <= this.timeToNum(end))) {
      times.push(t);
      if(t.minutes + increment == 60) {
        t = this.makeTime(t.hours + 1, 0);
      } else {
        t = this.makeTime(t.hours, t.minutes + increment);
      }
    }
    return times;
  }
  public makeTime(hours: number, minutes: number): Time {
    return {
      hours: hours,
      minutes: minutes
    }
  }
  //hh:mm am/pm to object
  public stringToTime(time: string): Time {
    let timeArray = time.split(" ");
    let hours = Number.parseInt(timeArray[0].split(":")[0]);
    let minutes = Number.parseInt(timeArray[0].split(":")[1]);
    let period = timeArray[1].toLowerCase();
    if(period == "am") {
      if(hours == 12) {
        hours = 0;
      }
    } else {
      if(hours != 12) {
        hours+=12;
      }
    }
    return {hours: hours, minutes: minutes} as Time;
  }
  public getHourSpan(shift: Shift): string {
    return `${this.timeToString(shift.startTime)} - ${this.timeToString(shift.endTime)}`
  }
  public blankTime(): Time {
    return {hours: 0, minutes: 0} as Time;
  }
  public computeCoverage(sheet: Sheet, shifts: Shift[]): Coverage {
    let coverage = {covered: null, empty: null, over: null} as Coverage;
    coverage.covered = new Array(sheet.coverage.length).fill(0);
    coverage.empty = new Array(sheet.coverage.length).fill(0);
    coverage.over = new Array(sheet.coverage.length).fill(0);
    shifts.forEach((shift: Shift) => {
      this.generateTimeColumns(shift.startTime, shift.endTime, sheet.timeIncrement, true).forEach((time: Time) => {
        let timeIndex = this.getTimeIndex(time, sheet.openTime, sheet.timeIncrement);
        coverage.covered[timeIndex]++;
      });
    });
    coverage.over = coverage.covered.map((c: number, i: number) => c > sheet.coverage[i] ? c - sheet.coverage[i] : 0);
    coverage.empty = coverage.covered.map((c: number, i: number) => c < sheet.coverage[i] ? sheet.coverage[i] - c : 0);
    coverage.covered = coverage.covered.map((c: number, i: number) => c > sheet.coverage[i] ? sheet.coverage[i] : c);
    return coverage;
    // this.computeOpenShifts();
  }
  computeOpenShifts(coverage: Coverage, shiftTimes: Time[]): {start: Time, end: Time}[] {
    let openShifts = [];
    let startIndex = 0;
    let emptyCopy = coverage.empty.slice();
    while(startIndex < emptyCopy.length-1) {
      //If there is no spot open, continue on
      if(!emptyCopy[startIndex]) {
        startIndex++;
      } else {
        let index = startIndex;
        //While there is a slot open, increment the index and decrement the slot
        while(emptyCopy[index] && index < emptyCopy.length-1) {
          emptyCopy[index]--;
          index++;
        }
        openShifts.push({start: shiftTimes[startIndex], end: shiftTimes[index]});
      }
    }
    return openShifts;
  }
}
