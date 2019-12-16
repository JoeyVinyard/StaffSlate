import { Component, ViewChild, AfterViewInit, OnChanges, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule } from 'src/app/models/schedule';
import { Location } from 'src/app/models/location';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Sheet } from 'src/app/models/sheet';
import { LocationService } from 'src/app/services/location.service';
import { Employee } from 'src/app/models/employee';
import { Shift } from 'src/app/models/shift';
import { MatDialog, MatMenu } from '@angular/material';
import { NewShiftDialogComponent } from './new-shift-dialog/new-shift-dialog.component';
import { Time } from '@angular/common';
import { SheetService } from 'src/app/services/sheet.service';
import { NewSheetDialogComponent } from './new-sheet-dialog/new-sheet-dialog.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DeleteSheetConfirmationComponent } from './delete-sheet-confirmation/delete-sheet-confirmation.component';
import { DocumentChangeAction } from '@angular/fire/firestore';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  
  private currentLocation: Location;
  private currentSchedule: Schedule;
  private curSheet: Sheet;
  private sheets: Sheet[];
  private shifts: Shift[];
  private createdShifts: Shift[];
  private remainingSpace: number = 0;
  private timeColumns: Time[] = [];
  
  private times: number[] = [];
  private hovered: Shift = null;
  
  @ViewChild("schedule", {static: false}) scheduleEl: ElementRef<HTMLElement>;
  @ViewChild("container", {static: false}) containerEl: ElementRef<HTMLElement>;

  private openNewSheetDeleteConfirmation(): void {
    const dialogRef = this.dialog.open(DeleteSheetConfirmationComponent, {
      width: '500px',
      data: this.curSheet.label
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if(confirmed) {
        let i = this.sheets.indexOf(this.curSheet);
        let del = this.currentSchedule.sheetOrder.splice(i,1)[0];
        this.currentSchedule.sheetOrder.forEach((v,i) => {
          if(v > del){
            this.currentSchedule.sheetOrder[i]=v-1;
          }
        })
        this.currentSchedule.document.update({
          sheetOrder: this.currentSchedule.sheetOrder
        });
        this.curSheet.document.delete();
      }
    });
  }

  private openNewShiftDialog(shift?: Shift): void {
    const dialogRef = this.dialog.open(NewShiftDialogComponent, {
      width: '400px',
      data: {
        sheet: this.curSheet,
        shift: shift
      }
    });
    dialogRef.afterClosed().subscribe((newShift: Shift) => {
      if(newShift) {
        if(shift) {
          this.curSheet.document.collection("shifts").doc(shift.id).update(newShift);
        } else {
          this.curSheet.document.collection("shifts").add(newShift);
        }
      }
    });
  }

  private openNewSheetDialog(sheet?: Sheet): void {
    const dialogRef = this.dialog.open(NewSheetDialogComponent, {
      width: '400px',
      data: {
        sheet: sheet
      }
    });
    dialogRef.afterClosed().subscribe((newSheet: Sheet) => {
      if(newSheet) {
        if(sheet) {
          sheet.document.update(newSheet);
        } else {
          this.currentSchedule.document.collection("sheets").add(newSheet).then(() => {
            this.currentSchedule.sheetOrder.push(this.currentSchedule.sheetOrder.length);
            this.currentSchedule.document.update({
              sheetOrder: this.currentSchedule.sheetOrder
            });
          })
        }
      }
    });
  }

  private deleteShift(shift: Shift) {
    this.curSheet.document.collection("shifts").doc(shift.id).delete().catch((err) => {
      console.error(err);
    });
  }

  private dropSheetLabel(dropEv: CdkDragDrop<HTMLDivElement>) {
    let v = this.currentSchedule.sheetOrder[dropEv.previousIndex];
    this.currentSchedule.sheetOrder[dropEv.previousIndex] = this.currentSchedule.sheetOrder[dropEv.currentIndex];
    this.currentSchedule.sheetOrder[dropEv.currentIndex] = v;
    this.currentSchedule.document.update({
      sheetOrder: this.currentSchedule.sheetOrder
    });
  }

  private convertTimeToNum(t: Time): number {
    return t.hours*100 + t.minutes;
  }

  private shouldShade(time: Time, shift: Shift, left: boolean): boolean {
    let convertedTime = this.convertTimeToNum(time);
    let convertedStart = this.convertTimeToNum(shift.startTime);
    let convertedEnd = this.convertTimeToNum(shift.endTime);
    return this.isInShift(convertedTime, convertedStart, convertedEnd)
    && (!left || (left && convertedTime != convertedStart))
    && (left || (!left && convertedTime != convertedEnd));

  }

  private isInShift(time: number, start: number, end: number) {
    return time >= start && time <= end;
  }
  
  private generateTimeColumns(): Time[] {
    let s = this.curSheet.openTime.hours + this.curSheet.openTime.minutes/60;
    let e = this.curSheet.closeTime.hours + this.curSheet.closeTime.minutes / 60;
    let numColumns = Math.floor(e-s+1)*(60/this.curSheet.timeIncrement);
    let times: Time[] = [];
    let h = this.curSheet.openTime.hours;
    let m = this.curSheet.openTime.minutes;
    times.push(this.curSheet.openTime);
    for(let i = 0; i < numColumns-1; i++) {
      m+= this.curSheet.timeIncrement;
      if(m % 60 == 0) {
        m = 0;
        h++;
      }
      let t = {
        hours: h,
        minutes: m
      } as Time
      times.push(t);
    }
    return times;
  }

  private formatTime(time: Time): string {
    let m = time.minutes < 10 ? "0"+time.minutes : time.minutes;
    if(time.hours == 0) {
      return `12:${m}am`;
    } else if(time.hours < 12) {
      return `${time.hours}:${m}am`;
    } else if(time.hours == 12) {
      return `${time.hours}:${m}pm`;
    } else {
      return `${time.hours%12}:${m}pm`;
    }
  }

  private enter(shift: Shift) {
    this.hovered = shift;
  }

  private makeDummyRows(containerHeight: number, numRows: number) {
    let baseHeight = 22; //Header row
    let rowHeight = 34; //26px row height, 8 px buffer
    let dummyShifts = Math.floor(((containerHeight - baseHeight) - (numRows*rowHeight))/rowHeight);
    this.createdShifts = Array.from(this.shifts);
    for(let i = 0; i < dummyShifts; i++){
      this.createdShifts.push(null);
    }
    this.remainingSpace = (containerHeight - baseHeight)%rowHeight;
  }

  private resizeSchedule() {
    this.makeDummyRows(this.containerEl.nativeElement.clientHeight, this.shifts.length);
  }

  private loadSheet(label?: string): void {
    if(label && label == this.curSheet.label) {
      return;
    }
    label = label || "";
    this.curSheet = this.sheets.find(sh => sh.label == label) || this.sheets[this.currentSchedule.sheetOrder[0]];
    this.curSheet.loadShifts().subscribe((shiftSnapshots: DocumentChangeAction<Shift>[]) => {
      let shifts = shiftSnapshots.map((s) => {
        let sd = s.payload.doc.data()
        sd.id = s.payload.doc.id
        return sd;
      });
      this.shifts = shifts.sort((a, b) => {
        let r = this.convertTimeToNum(a.startTime) - this.convertTimeToNum(b.startTime);
        if(r == 0) {
          return this.convertTimeToNum(a.endTime) - this.convertTimeToNum(b.endTime);
        }
        return r;
      });
      this.makeDummyRows(this.containerEl.nativeElement.clientHeight, this.shifts.length);
    })
    this.timeColumns = this.generateTimeColumns();
  }

  private parseSchedule(): void {
    this.currentSchedule.loadSheets().subscribe((sheets) => {
      this.sheets = sheets.map((s) => {
        let sheet: Sheet = new Sheet(s.payload.doc.data(), this.currentSchedule.document.collection("sheets").doc(s.payload.doc.id));
        return sheet;
      });
      this.loadSheet();
    });
  }
  
  private parseName(emp: Employee) {
    return `${emp.firstName} ${emp.lastName.substring(0,1)}.`;
  }
  
  constructor(
    private locationService: LocationService,
    private sheetService: SheetService,
    private scheduleService: ScheduleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog) {

    locationService.currentLocation.subscribe((location) => {
      this.currentLocation = location;
    })

    activatedRoute.paramMap.subscribe((map) => {
      this.scheduleService.loadSchedule(map.get("scheduleId")).subscribe((schedule) => {
        this.currentSchedule = schedule;
        this.parseSchedule();
      });
    });
  }
}
