import { Component, OnInit, Inject, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Sheet } from 'src/app/models/sheet';
import { CoverageDialogComponent } from '../coverage-dialog/coverage-dialog.component';
import { TimeService } from 'src/app/services/time.service';
import { Time } from '@angular/common';
import { Shift } from 'src/app/models/shift';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-view-coverage-dialog',
  templateUrl: './view-coverage-dialog.component.html',
  styleUrls: ['./view-coverage-dialog.component.css']
})
export class ViewCoverageDialogComponent implements OnDestroy {
  
  alive: Subject<boolean> = new Subject();
  times: Time[];
  shiftTimes: Time[];
  sheet: Sheet;
  covered: number[];
  empty: number[];
  over: number[];
  openShifts: {start: Time, end: Time}[]

  close(): void {
    this.dialogRef.close();
  }

  computeCoverage(shifts: Shift[]) {
    this.covered = new Array(this.sheet.coverage.length).fill(0);
    this.empty = new Array(this.sheet.coverage.length).fill(0);
    this.over = new Array(this.sheet.coverage.length).fill(0);
    shifts.forEach((shift: Shift) => {
      this.timeService.generateTimeColumns(shift.startTime, shift.endTime, this.sheet.timeIncrement, true).forEach((time: Time) => {
        let timeIndex = this.timeService.getTimeIndex(time, this.sheet.openTime, this.sheet.timeIncrement);
        this.covered[timeIndex]++;
      });
    });
    this.over = this.covered.map((c: number, i: number) => c > this.sheet.coverage[i] ? c - this.sheet.coverage[i] : 0);
    this.empty = this.covered.map((c: number, i: number) => c < this.sheet.coverage[i] ? this.sheet.coverage[i] - c : 0);
    this.covered = this.covered.map((c: number, i: number) => c > this.sheet.coverage[i] ? this.sheet.coverage[i] : c);
    this.computeOpenShifts();
  }

  computeOpenShifts() {
    this.openShifts = [];
    let startIndex = 0;
    let emptyCopy = this.empty.slice();
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
        this.openShifts.push({start: this.shiftTimes[startIndex], end: this.shiftTimes[index]});
      }
    }
    console.log(this.openShifts);
  }

  parseShift(shift: {start: Time, end: Time}): string {
    return `${this.timeService.timeToString(shift.start)} - ${this.timeService.timeToString(shift.end)}`
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(
    public dialogRef: MatDialogRef<CoverageDialogComponent>,
    public timeService: TimeService,
    public cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: Sheet
  ) {
    this.sheet = data;
    this.times = timeService.generateTimeColumns(this.sheet.openTime, this.sheet.closeTime, this.sheet.timeIncrement, true);
    this.shiftTimes = timeService.generateTimeColumns(this.sheet.openTime, this.sheet.closeTime, this.sheet.timeIncrement, false);
    this.sheet.loadShifts().pipe(takeUntil(this.alive)).subscribe((shifts: Shift[]) => {
      this.computeCoverage(shifts);
    });
  }
}
