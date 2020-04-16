import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Sheet } from 'src/app/models/sheet';
import { Time } from '@angular/common';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-coverage-dialog',
  templateUrl: './coverage-dialog.component.html',
  styleUrls: ['./coverage-dialog.component.css']
})
export class CoverageDialogComponent implements AfterViewInit{

  times: Time[];
  sheet: Sheet;
  blocks: number[] = [...Array(10).keys()];
  blockWidth: number = 10;
  coverage: number[] = [];

  @ViewChild("container", {static: true}) containerEl: ElementRef<HTMLDivElement>;
  @ViewChildren("time", {read: ElementRef}) timeCells: QueryList<ElementRef<HTMLDivElement>>;
  
  submit(): void {
    this.dialogRef.close(this.coverage);
  }

  defineBlockWidths() {
    let greatestWidthTime = this.timeCells
                              .map((tc: ElementRef<HTMLTableDataCellElement>) => tc.nativeElement.clientWidth)
                              .reduce((greatest, width) => greatest > width ? greatest : width) + 12;//Get greatest width + padding
    let remainingSpace = this.containerEl.nativeElement.clientWidth - greatestWidthTime-20;//account for scrollbar
    this.blockWidth = Math.max(Math.floor(remainingSpace/this.blocks.length)-1, 17);//account for padding
    this.cdr.detectChanges();
  }
 
  public select(timeIndex: number, block: number) {
    this.coverage[timeIndex]=block;
    if(block >= this.blocks.length-2) {
      this.blocks = [...Array(this.blocks.length+2).keys()]
      this.defineBlockWidths();
    } else if(block <= this.blocks.length - 4) {
      let max = this.coverage.reduce((greatest, width) => greatest > width ? greatest: width)
      if(max == block) {
        this.blocks = [...Array(max + 3).keys()];
        this.defineBlockWidths();
      }
    }
  }

  ngAfterViewInit() {
    this.defineBlockWidths();
  }

  constructor(
    public dialogRef: MatDialogRef<CoverageDialogComponent>,
    public timeService: TimeService,
    public cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: Sheet
  ) {
    this.sheet = data;
    this.times = timeService.generateTimeColumns(this.sheet.openTime, this.sheet.closeTime, this.sheet.timeIncrement, true);
    this.coverage = this.sheet.coverage || new Array(this.times.length).fill(0);
  }
}
