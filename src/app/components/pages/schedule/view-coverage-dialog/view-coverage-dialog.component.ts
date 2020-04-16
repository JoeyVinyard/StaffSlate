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
  sheet: Sheet;
  covered: number[];
  empty: number[];
  over: number[];

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
    this.sheet.loadShifts().pipe(takeUntil(this.alive)).subscribe((shifts: Shift[]) => {
      this.computeCoverage(shifts);
    });
  }
}
