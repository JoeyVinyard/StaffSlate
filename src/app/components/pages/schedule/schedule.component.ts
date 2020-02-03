import { Component, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule, PrintSchedule } from 'src/app/models/schedule';
import { TimeService } from 'src/app/services/time.service';
import { Sheet } from 'src/app/models/sheet';
import { Employee } from 'src/app/models/employee';
import { Shift } from 'src/app/models/shift';
import { MatDialog } from '@angular/material';
import { NewShiftDialogComponent } from './new-shift-dialog/new-shift-dialog.component';
import { Time } from '@angular/common';
import { NewSheetDialogComponent } from './new-sheet-dialog/new-sheet-dialog.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DeleteSheetConfirmationComponent } from './delete-sheet-confirmation/delete-sheet-confirmation.component';
import { LocationService } from 'src/app/services/location.service';
import { Subscription } from 'rxjs';
import { DocumentReference } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Location } from 'src/app/models/location';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnDestroy, AfterViewInit{
  
  private preventSheetChange: boolean = false;
  private subscriptions: Subscription[] = [];
  private currentSchedule: Schedule;
  private curSheet: Sheet;
  private shifts: Shift[];
  private createdShifts: Shift[];
  private remainingSpace: number = 0;
  private timeColumns: Time[] = [];
  private sheetSub: Subscription;
  private shiftSub: Subscription;
  
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
        let i = this.currentSchedule.sheets.findIndex(id => id.display == this.curSheet.label);
        this.currentSchedule.sheets.splice(i,1)[0];
        this.curSheet.document.delete().then(() => {
          this.sheetSub.unsubscribe();
          this.currentSchedule.document.update({
            sheets: this.currentSchedule.sheets
          });
        });
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
    this.subscriptions.push(dialogRef.afterClosed().subscribe((newShift: Shift) => {
      if(newShift) {
        if(shift) {
          shift.document.update(newShift);
        } else {
          this.curSheet.document.collection("shifts").add(newShift);
        }
      }
    }));
  }
  
  private openNewSheetDialog(edit: boolean = false): void {
    const dialogRef = this.dialog.open(NewSheetDialogComponent, {
      width: '400px',
      data: {
        sheet: edit ? this.curSheet : null
      }
    });
    this.subscriptions.push(dialogRef.afterClosed().subscribe((newSheet: Sheet) => {
      if(newSheet) {
        if(edit) {
          this.curSheet.document.update(newSheet);
          if(this.curSheet.label != newSheet.label) {
            let i = this.currentSchedule.sheets.findIndex(id => id.display == this.curSheet.label);
            this.currentSchedule.sheets[i].display = newSheet.label;
            this.currentSchedule.document.update({
              sheets: this.currentSchedule.sheets
            });
          }
        } else {
          this.currentSchedule.document.collection("sheets").add(newSheet).then((ref: DocumentReference) => {
            this.currentSchedule.sheets.push({key: ref.id, display: newSheet.label});
            this.currentSchedule.document.update({
              sheets: this.currentSchedule.sheets
            });
          })
        }
      }
    }));
  }
  
  private deleteShift(shift: Shift) {
    shift.document.delete().catch((err) => {
      console.error(err);
    });
  }
  
  private dropSheetLabel(dropEv: CdkDragDrop<HTMLDivElement>) {
    let spliced = this.currentSchedule.sheets.splice(dropEv.previousIndex,1)[0];
    this.currentSchedule.sheets.splice(dropEv.currentIndex,0,spliced);
    this.preventSheetChange = true;
    this.currentSchedule.document.update({
      sheets: this.currentSchedule.sheets
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
    let e = this.curSheet.closeTime.hours + this.curSheet.closeTime.minutes/60;
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
    return this.timeService.timeToString(time);
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
  
  private getHourSpan(shift: Shift): string {
    return `${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}`
  }
  
  private mobile() {
    return window.innerWidth < 360;
  }
  
  private getViewLink(): string {
    return `http://www.picostaff.com${this.router.url}/${this.currentSchedule.viewId}`;
    // return `http://localhost:4200/schedule/1jJcKnmmFvQTeTLIzDVf/I3ECXBQ0YpBSEcB2NIc5`;
  }
  
  private displaySheetClick(sheetLabel: string): void {
    if(this.curSheet.label == sheetLabel) {
      return;
    } else {
      this.displaySheet(sheetLabel);
    }
  }

  private displaySheet(sheetLabel: string): void {
    if(this.sheetSub) {
      this.sheetSub.unsubscribe();
    }
    this.sheetSub = this.currentSchedule.loadSheetData(sheetLabel).subscribe((sheet) => {
      this.curSheet = sheet;
      if(!sheet) {
        return;
      }
      this.timeColumns = this.generateTimeColumns();
      if(this.shiftSub) {
        this.shiftSub.unsubscribe();
      }
      this.shiftSub = this.curSheet.loadShifts().subscribe((shifts) => {
        this.shifts = shifts.sort((a, b) => {
          let r = this.convertTimeToNum(a.startTime) - this.convertTimeToNum(b.startTime);
          if(r == 0) {
            return this.convertTimeToNum(a.endTime) - this.convertTimeToNum(b.endTime);
          }
          return r;
        });
        this.makeDummyRows(this.containerEl.nativeElement.clientHeight, this.shifts.length);
      });
    });
  }
  
  private parseName(emp: Employee) {
    return `${emp.firstName} ${emp.lastName.substring(0,1)}.`;
  }

  private printSchedule() {
    this.currentSchedule.printSchedule().then((printSchedule: PrintSchedule) => {
      printSchedule.timeIncrement = this.curSheet.timeIncrement;
      this.locationService.getCurrentLocation().subscribe((location: Location) => {
        location.getEmployees().subscribe((employees: Map<string, Employee>) => {
          printSchedule.sheets.forEach((sheet) => {
            sheet.shifts.forEach(s => {
              let e: Employee = employees.get(s.empId);
              if(e) {
                s.empId = `${s.empId = e.firstName} ${e.lastName.substr(0,1)}.`
              } else {
                console.log(s);
                s.empId = "";
              }
            });
          })
          this.http.post("https://ps-pdf-server.herokuapp.com/pdf", {data: printSchedule}, {responseType: 'arraybuffer' }).subscribe((data) => {
          // this.http.post("http://localhost:3000/pdf", {data: printSchedule}, {responseType: 'arraybuffer', }).subscribe((data) => {
            let file = new Blob([data], { type: 'application/pdf' });
            let fUrl = URL.createObjectURL(file);
            window.open(fUrl);
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.activatedRoute.paramMap.subscribe((map) => {
      this.subscriptions.push(this.locationService.loadLocation(map.get("locationId")).subscribe((location) => {
        this.subscriptions.push(location.loadScheduleData(map.get("scheduleId")).subscribe((schedule) => {
          this.currentSchedule = schedule;
          if(schedule.sheets.length) {
            if(this.preventSheetChange) {
              this.preventSheetChange = false;
            } else {
              this.displaySheet(schedule.sheets[0].key)
              this.cdf.detectChanges();
            }
          } else {
            this.curSheet = null;
          }
        }));
      }));
    }));
  }

  constructor(
    private locationService: LocationService,
    private timeService: TimeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private aff: AngularFireFunctions,
    private cdf: ChangeDetectorRef,
    private http: HttpClient) {
      
    }
  }
    