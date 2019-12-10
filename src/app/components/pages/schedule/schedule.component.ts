import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule } from 'src/app/models/schedule';
import { Location } from 'src/app/models/location';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Sheet } from 'src/app/models/sheet';
import { LocationService } from 'src/app/services/location.service';
import { Employee } from 'src/app/models/employee';
import { Shift } from 'src/app/models/shift';
import { MatDialog } from '@angular/material';
import { NewShiftDialogComponent } from './new-shift-dialog/new-shift-dialog.component';
import { Time } from '@angular/common';
import { SheetService } from 'src/app/services/sheet.service';
import { NewSheetDialogComponent } from './new-sheet-dialog/new-sheet-dialog.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

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
  private timeColumns: Time[] = [];
  
  private times: number[] = [];
  
  private openNewShiftDialog(): void {
    const dialogRef = this.dialog.open(NewShiftDialogComponent, {
      width: '400px',
      data: this.curSheet
    });
    dialogRef.afterClosed().subscribe((newShift: Shift) => {
      if(newShift) {
        this.curSheet.document.collection("shifts").add(newShift);
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
          this.currentSchedule.document.collection("sheets").add(newSheet);
          this.currentSchedule.sheetOrder.push(this.currentSchedule.sheetOrder.length);
          this.currentSchedule.document.update({
            sheetOrder: this.currentSchedule.sheetOrder
          });
        }
      }
    });
  }

  dropSheetLabel(dropEv: CdkDragDrop<HTMLDivElement>) {
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

  private isInShift(time: Time, shift: Shift): boolean {
    return (this.convertTimeToNum(time) >= this.convertTimeToNum(shift.startTime)
      && this.convertTimeToNum(time) < this.convertTimeToNum(shift.endTime));
  }
  
  generateTimeColumns(): Time[] {
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
  
  loadSheet(label?: string): void {
    if(label && label == this.curSheet.label) {
      return;
    }
    label = label || "";
    this.curSheet = this.sheets.find(sh => sh.label == label) || this.sheets[0];
    this.curSheet.loadDisplayShifts().subscribe((shifts: Shift[]) => {
      this.shifts = shifts.sort((a, b) => {
        let r = this.convertTimeToNum(a.startTime) - this.convertTimeToNum(b.startTime);
        if(r == 0) {
          return this.convertTimeToNum(a.endTime) - this.convertTimeToNum(b.endTime);
        }
        return r;
      });
    })
    this.timeColumns = this.generateTimeColumns();
  }

  parseSchedule(): void {
    this.currentSchedule.loadSheets().subscribe((sheets) => {
      this.sheets = sheets.map((s) => {
        let sheet: Sheet = new Sheet(s.payload.doc.data(), this.currentSchedule.document.collection("sheets").doc(s.payload.doc.id));
        return sheet;
      });
      this.loadSheet();
    });
  }
  
  parseName(emp: Employee) {
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
