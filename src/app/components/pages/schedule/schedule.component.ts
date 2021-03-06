import { Component, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Schedule, PrintSchedule } from 'src/app/models/schedule';
import { TimeService } from 'src/app/services/time.service';
import { Sheet } from 'src/app/models/sheet';
import { Employee } from 'src/app/models/employee';
import { Shift } from 'src/app/models/shift';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewShiftDialogComponent } from './new-shift-dialog/new-shift-dialog.component';
import { Time } from '@angular/common';
import { NewSheetDialogComponent } from './new-sheet-dialog/new-sheet-dialog.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DeleteSheetConfirmationComponent } from './delete-sheet-confirmation/delete-sheet-confirmation.component';
import { LocationService } from 'src/app/services/location.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { DocumentReference } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Location } from 'src/app/models/location';
import { HttpClient } from '@angular/common/http';
import { SheetPromptDialogComponent } from './sheet-prompt-dialog/sheet-prompt-dialog.component';
import { switchMap, filter, map, take, takeUntil } from 'rxjs/operators';
import { CoverageDialogComponent } from './coverage-dialog/coverage-dialog.component';
import { ViewCoverageDialogComponent } from './view-coverage-dialog/view-coverage-dialog.component';
import { Coverage } from 'src/app/models/coverage';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnDestroy, AfterViewInit{
  
  private noSheetDialogOpen = false;
  private preventSheetChange: boolean = false;
  public mobile: boolean = false;
  public currentSchedule: Schedule;
  public curLocation: Location = null;
  public curSheet: Sheet = null;
  private curSheetId: string = null;
  private shifts: Shift[];
  public createdShifts: Shift[];
  public remainingSpace: number = 0;
  public timeColumns: Time[] = [];
  private routeParams: Params;
  private employees: Map<string, Employee> = null;
  private sheetSub: Subscription;
  private shiftSub: Subscription;

  public coverage: Coverage;
  public openShifts: {start: Time, end: Time}[];
  
  public times: number[] = [];
  public hovered: Shift = null;
  private alive: Subject<boolean> = new Subject();
  
  @ViewChild("schedule") scheduleEl: ElementRef<HTMLElement>;
  @ViewChild("container") containerEl: ElementRef<HTMLElement>;
  
  public openDefineCoverageDialog(): void {
    const dialogRef = this.dialog.open(CoverageDialogComponent, {
      width: '500px',
      data: this.curSheet
    });
    dialogRef.afterClosed().subscribe((coverage: number[]) => {
      if(coverage) {
        this.curSheet.document.update({coverage: coverage}).then(() => {
          this.snackbar.open("Coverage successfully updated!", "Dismiss", {duration: 2000});
        }).catch((err) => {
          console.error(err);
        });
      }
    })
  }

  public openViewCoverageDialog(): void {
    const dialogRef = this.dialog.open(ViewCoverageDialogComponent, {
      width: '500px',
      data: {sheet: this.curSheet, coverage: this.coverage, openShifts: this.openShifts}
    });
  }

  public openNewSheetDeleteConfirmation(): void {
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
          this.shiftSub.unsubscribe();
          this.currentSchedule.document.update({
            sheets: this.currentSchedule.sheets
          });
        });
      }
    });
  }
  
  public openNewShiftDialog(shift?: Shift): void {
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
          shift.document.update(newShift);
        } else {
          this.curSheet.document.collection("shifts").add(newShift);
        }
      }
    });
  }
  
  public openNewSheetDialog(edit: boolean = false): void {
    const dialogRef = this.dialog.open(NewSheetDialogComponent, {
      width: '400px',
      data: {
        sheet: edit ? this.curSheet : null
      }
    });
    dialogRef.afterClosed().subscribe((newSheet: Sheet) => {
      if(newSheet) {
        if(edit) {
          this.curSheet.document.update(newSheet);
          if(this.curSheet.label != newSheet.label) {
            let i = this.currentSchedule.sheets.findIndex(id => id.display == this.curSheet.label);
            this.currentSchedule.sheets[i].display = newSheet.label;
            this.currentSchedule.document.update({
              sheets: this.currentSchedule.sheets
            });
            this.snackbar.open("Sheet successfully updated.", "Dismiss", {duration: 3000});
          }
        } else {
          this.currentSchedule.document.collection("sheets").add(newSheet).then((ref: DocumentReference) => {
            this.currentSchedule.sheets.push({key: ref.id, display: newSheet.label});
            this.currentSchedule.document.update({
              sheets: this.currentSchedule.sheets
            });
            this.snackbar.open("Sheet successfully added.", "Dismiss", {duration: 3000});
          });
        }
      }
    });
  }
  
  public deleteShift(shift: Shift) {
    shift.document.delete().catch((err) => {
      console.error(err);
    });
  }
  
  public dropSheetLabel(dropEv: CdkDragDrop<HTMLDivElement>) {
    let spliced = this.currentSchedule.sheets.splice(dropEv.previousIndex,1)[0];
    this.currentSchedule.sheets.splice(dropEv.currentIndex,0,spliced);
    this.preventSheetChange = true;
    this.currentSchedule.document.update({
      sheets: this.currentSchedule.sheets
    });
  }
  
  public shouldShade(time: Time, shift: Shift, left: boolean): boolean {
    let convertedTime = this.timeService.timeToNum(time);
    let convertedStart = this.timeService.timeToNum(shift.startTime);
    let convertedEnd = this.timeService.timeToNum(shift.endTime);
    return this.isInShift(convertedTime, convertedStart, convertedEnd)
    && (!left || (left && convertedTime != convertedStart))
    && (left || (!left && convertedTime != convertedEnd));
  }
  
  private isInShift(time: number, start: number, end: number) {
    return time >= start && time <= end;
  }
  
  public enter(shift: Shift) {
    this.hovered = shift;
  }
  
  private makeDummyRows(containerHeight: number, numRows: number) {
    let baseHeight = 22; //Header row
    let rowHeight = 34; //26px row height, 8 px buffer
    let dummyShifts = Math.floor(((containerHeight - baseHeight) - (numRows*rowHeight))/rowHeight);
    this.createdShifts = Array.from(this.shifts || []);
    for(let i = 0; i < dummyShifts; i++){
      this.createdShifts.push(null);
    }
    this.remainingSpace = (containerHeight - baseHeight)%rowHeight;
  }
  
  public resizeSchedule() {
    if(this.shifts) {
      this.makeDummyRows(this.containerEl.nativeElement.clientHeight, this.shifts.length);
    }
    this.mobile = window.innerWidth < 750;
  }
  
  public copyShareToClipboard(): void {
    navigator.clipboard.writeText(this.getViewLink()).then(() => {
      this.snackbar.open("Share link copied to clipboard!", "Dismiss", {duration: 2000});
    }).catch((err) => {
      this.snackbar.open("Failed to copy to clipboard. Please try again.");
    });
  }

  private getViewLink(): string {
    return `http://www.picostaff.com${this.router.url}/${this.currentSchedule.viewId}`;
  }
  
  public displaySheetClick(sheetId: string): void {
    if(this.curSheetId == sheetId) {
      return;
    } else {
      this.displaySheet(sheetId);
    }
  }

  private displaySheet(sheetId: string): void {
    if(this.sheetSub) {
      this.sheetSub.unsubscribe();
    }
    this.sheetSub = this.currentSchedule.loadSheetData(sheetId).subscribe((sheet) => {
      if(!sheet || sheet == this.curSheet) {
        return;
      }
      this.curSheet = sheet;
      this.curSheetId = sheetId;
      this.timeColumns = this.timeService.generateTimeColumns(this.curSheet.openTime, this.curSheet.closeTime, this.curSheet.timeIncrement);
      if(this.shiftSub) {
        this.shiftSub.unsubscribe();
      }
      this.shiftSub = this.curSheet.loadShifts().subscribe((shifts) => {
        this.coverage = this.timeService.computeCoverage(this.curSheet, shifts);
        this.openShifts = this.timeService.computeOpenShifts(this.coverage, this.timeColumns);
        this.shifts = shifts.sort((a, b) => {
          let r = this.timeService.timeToNum(a.startTime) - this.timeService.timeToNum(b.startTime);
          if(r == 0) {
            return this.timeService.timeToNum(a.endTime) - this.timeService.timeToNum(b.endTime);
          }
          return r;
        });
        this.resizeSchedule();
      });
    });
  }
  
  public parseName(emp: string): Observable<string> {
    return this.curLocation.getEmployees().pipe(take(1), map((m) => {
      const employee = m.get(emp);
      return `${employee.firstName} ${employee.lastName.substring(0,1)}.`;
    }));
  }

  public printSchedule() {
    let printSubject = new Subject();
    let compileSnackbarRef = this.snackbar.open("Compiling Schedule Data...", "dismiss");
    this.currentSchedule.printSchedule().then((printSchedule: PrintSchedule) => {
      printSchedule.timeIncrement = this.curSheet.timeIncrement;
      this.locationService.getCurrentLocation().pipe (
          takeUntil(printSubject),
          switchMap((location: Location) => location.getEmployees()))
        .subscribe((employees: Map<string, Employee>) => {
        printSchedule.sheets.forEach((sheet) => {
          sheet.shifts.forEach(s => {
            let e: Employee = employees.get(s.empId);
            if(e) {
              s.empId = `${s.empId = e.firstName} ${e.lastName.substr(0,1)}.`
            } else {
              s.empId = "";
            }
          });
        })
        compileSnackbarRef.dismiss();
        let printSnackbar = this.snackbar.open("Printing Schedule...", "dismiss");
        this.http.post("https://ps-pdf-server.herokuapp.com/pdf", {data: printSchedule}, {responseType: 'arraybuffer' }).subscribe((data) => {
          let file = new Blob([data], { type: 'application/pdf' });
          let fUrl = URL.createObjectURL(file);
          printSnackbar.dismiss();
          this.snackbar.open("Schedule successfully generated!", "dismiss", {duration: 2000});
          window.open(fUrl);
          printSubject.next();
        });
      });
    });
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  ngAfterViewInit() {
    this.makeDummyRows(this.containerEl.nativeElement.clientHeight, 0);
    this.activatedRoute.paramMap.pipe(
      switchMap((params) => {
        this.routeParams = params;
        return this.locationService.loadLocation(params.get("locationId"));
      }),
      filter((location) => !!(location)),
      switchMap((location) => {
        this.curLocation = location;
        return location.loadScheduleData(this.routeParams.get("scheduleId"))
      }),
      takeUntil(this.alive)
    ).subscribe((schedule) => {
      // Protect against last schedule in memory from being displayed
      if(schedule.document.ref.id == this.routeParams.get("scheduleId")) {
        this.currentSchedule = schedule;
        if(this.currentSchedule.hasSheets()) {
          // Don't change sheets if the schedule was updating from a firestore change
          if(this.preventSheetChange) {
            this.preventSheetChange = false;
          } else {
            this.displaySheet(this.currentSchedule.sheets[0].key);
            this.cdf.detectChanges();
          }
        } else {
          // If they aren't a guest, prompt them to make a sheet
          if(!this.activatedRoute.snapshot.data.guest && !this.noSheetDialogOpen) {
            let dialogRef = this.dialog.open(SheetPromptDialogComponent, {width: "500px"});
            dialogRef.afterClosed().subscribe(() => this.noSheetDialogOpen = false);
            this.noSheetDialogOpen = true;;
          }
          this.curSheet = null;
          this.curSheetId = null;
        }
      } else {
        // If the schedule doesn't match the route, don't display it
        this.curSheet = null;
        this.curSheetId = null;
      }
    });
  }

  constructor(
    public locationService: LocationService,
    public timeService: TimeService,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private aff: AngularFireFunctions,
    private cdf: ChangeDetectorRef,
    public snackbar: MatSnackBar,
    private http: HttpClient) {
      
    }
  }
    