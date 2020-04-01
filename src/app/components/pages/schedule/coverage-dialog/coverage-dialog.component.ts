import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Sheet } from 'src/app/models/sheet';
import { Time } from '@angular/common';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-coverage-dialog',
  templateUrl: './coverage-dialog.component.html',
  styleUrls: ['./coverage-dialog.component.css']
})
export class CoverageDialogComponent {

  times: Time[];
  sheet: Sheet;
  blocks: number[] = [...Array(10).keys()];
  coverage: number[];

  constructor(
    public dialogRef: MatDialogRef<CoverageDialogComponent>,
    public timeService: TimeService,
    @Inject(MAT_DIALOG_DATA) public data: Sheet
  ) {
    this.sheet = data;
    this.times = timeService.generateTimeColumns(this.sheet.openTime, this.sheet.closeTime, this.sheet.timeIncrement);
    this.coverage = new Array(this.times.length);
  }

  submit(): void {
    this.dialogRef.close();
  }

}
