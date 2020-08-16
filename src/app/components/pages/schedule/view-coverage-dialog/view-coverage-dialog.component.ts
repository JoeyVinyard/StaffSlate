import { Component, Inject, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Sheet } from 'src/app/models/sheet';
import { CoverageDialogComponent } from '../coverage-dialog/coverage-dialog.component';
import { TimeService } from 'src/app/services/time.service';
import { Time } from '@angular/common';
import { Subject } from 'rxjs';
import { Coverage } from 'src/app/models/coverage';

@Component({
  selector: 'app-view-coverage-dialog',
  templateUrl: './view-coverage-dialog.component.html',
  styleUrls: ['./view-coverage-dialog.component.css']
})
export class ViewCoverageDialogComponent implements OnDestroy, AfterViewInit {
  
  alive: Subject<boolean> = new Subject();
  blockWidth: number = 10;
  times: Time[];
  shiftTimes: Time[];
  sheet: Sheet;
  coverage: Coverage;
  openShifts: {start: Time, end: Time}[]

  @ViewChild("container", {static: true}) containerEl: ElementRef<HTMLDivElement>;

  close(): void {
    this.dialogRef.close();
  }

  parseShift(shift: {start: Time, end: Time}): string {
    return `${this.timeService.timeToString(shift.start)} - ${this.timeService.timeToString(shift.end)}`
  }

  ngAfterViewInit() {
    let longest = Math.max(...this.coverage.covered.map((v, i) => v+this.coverage.empty[i]+this.coverage.over[i]));
    let containerWidth = this.containerEl.nativeElement.clientWidth;
    this.blockWidth = Math.max(15,((containerWidth-90)/longest)-4)//account for padding and time column
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(
    public dialogRef: MatDialogRef<CoverageDialogComponent>,
    public timeService: TimeService,
    public cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data : {sheet: Sheet, coverage: Coverage, openShifts: {start: Time, end: Time}[]}
  ) {
    this.sheet = data.sheet;
    this.coverage = data.coverage;
    this.openShifts = data.openShifts;
    this.times = timeService.generateTimeColumns(this.sheet.openTime, this.sheet.closeTime, this.sheet.timeIncrement, true);
    this.shiftTimes = timeService.generateTimeColumns(this.sheet.openTime, this.sheet.closeTime, this.sheet.timeIncrement, false);
  }
}
