import { Component, ViewChild, AfterViewInit, Inject, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Employee } from 'src/app/models/employee';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Sheet } from 'src/app/models/sheet';
import { Shift } from 'src/app/models/shift';
import { Time } from '@angular/common';
import { TimeService } from 'src/app/services/time.service';
import { NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-new-shift-dialog',
  templateUrl: './new-shift-dialog.component.html',
  styleUrls: ['./new-shift-dialog.component.css']
})
export class NewShiftDialogComponent implements AfterViewInit, OnDestroy {

  alive: Subject<boolean> = new Subject<boolean>();
  shifts: Shift[];
  employees: Map<string,Employee>;
  employeeIds: string[];
  employeeShifts: Shift[] = [];
  employee: FormControl = new FormControl('', [Validators.required]);
  shiftStart: FormControl = new FormControl('', [Validators.required]);
  shiftEnd = new FormControl('', [Validators.required]);

  @ViewChild("start", { static: true }) shiftStartField: NgxMaterialTimepickerComponent;
  @ViewChild("end", {static: true}) shiftEndField: NgxMaterialTimepickerComponent;

  private timeEqual(t1: Time, t2: Time): boolean {
    return t1.hours == t2.hours && t1.minutes == t2.minutes;
  }

  private timeGreaterThanEqual(t1: Time, t2: Time): boolean {
    //Returns true if t1 is greater than t2
    return (t1.hours > t2.hours || (t1.hours==t2.hours && t1.minutes>=t2.minutes));
  }

  private timeLessThanEqual(t1: Time, t2: Time): boolean {
    //Returns true if t1 is less than than t2
    return (t1.hours < t2.hours || (t1.hours==t2.hours && t1.minutes<=t2.minutes));
  }

  private shiftIsOriginal(shift: Shift): boolean {
    return this.timeEqual(shift.startTime, this.data.shift.startTime) && this.timeEqual(shift.endTime, this.data.shift.endTime);
  } 

  private shiftsOverlap(): boolean {
    return !this.employeeShifts.every((shift: Shift) => {
      let newShiftStart = this.timeService.stringToTime(this.shiftStart.value);
      let newShiftEnd = this.timeService.stringToTime(this.shiftEnd.value);
      if(this.data.shift) {
        return (this.timeLessThanEqual(newShiftEnd, shift.startTime) || this.timeGreaterThanEqual(newShiftStart, shift.endTime)) || this.shiftIsOriginal(shift);
      } else {
        return (this.timeLessThanEqual(newShiftEnd, shift.startTime) || this.timeGreaterThanEqual(newShiftStart, shift.endTime));
      }
    });
  }
  
  public getEmployeeError(): string {
    if (this.employee.hasError("required")) {
      return "Please select an Employee";
    } else {
      return "";
    }
  }
  
  public getShiftStartError(): string {
    if (this.shiftStart.hasError("required")) {
      return "Please select a time";
    } else {
      return "";
    }
  }
  
  public getShiftEndError(): string {
    if (this.shiftEnd.hasError("required")) {
      return "Please select a time";
    } else if(this.shiftsOverlap()) {
      return "New shift cannot overlap with existing shifts";
    } else {
      return "";
    }
  }
    
  public displayFn(empId: string): string {
    if(!this.employees) {
      return "";
    }
    let emp = this.employees.get(empId);
    if(emp) {
      return emp.firstName + " " + emp.lastName;
    } else {
      return "";
    }
  }

  public filterIds(): string[] {
    return this.employeeIds.filter((id) => {
      let employee = this.employees.get(id);
      return `${employee.firstName.toLowerCase()} ${employee.lastName.toLowerCase()}`.includes(this.employee.value.toLowerCase());
    });
  }

  public submit(): void {
    this.dialogRef.close({
      empId: this.employee.value,
      startTime: this.timeService.stringToTime(this.shiftStart.value),
      endTime: this.timeService.stringToTime(this.shiftEnd.value)
    } as Shift);
  }
  
  private loadEmployeeShifts(empId: string): void {
    if(this.employees.has(empId)) {
      this.employeeShifts = this.shifts.filter((shift: Shift) => shift.empId == empId);
      console.log(this.employeeShifts);
    }
  }
  
  private loadShiftData(): void {
    this.data.sheet.loadShifts().pipe(takeUntil(this.alive)).subscribe((shifts: Shift[]) => {
      this.shifts = shifts;
      if(this.employee.value) {
        this.loadEmployeeShifts(this.employee.value);
      }
    });
  }

  private loadEmployeeData(): void {
    this.locationService.getCurrentLocation().pipe(
      switchMap((location:Location) => location.getEmployees()),
      takeUntil(this.alive))
    .subscribe((employees) => {
      this.employees = employees;
      this.employeeIds = Array.from(employees.keys());
      if(this.data.shift) {
        this.employee.setValue(this.data.shift.empId);
        this.shiftStart.setValue(this.timeService.timeToString(this.data.shift.startTime));
        this.shiftEnd.setValue(this.timeService.timeToString(this.data.shift.endTime));
      } else {
        this.shiftStart.setValue(this.timeService.timeToString(this.data.sheet.openTime));
        this.shiftEnd.setValue(this.timeService.timeToString(this.data.sheet.closeTime));
      }
    });
  }

  ngAfterViewInit() {
    this.shiftStart.valueChanges.subscribe((val) => {
      this.shiftEnd.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    this.alive.next(true);
  }

  constructor(
    public dialogRef: MatDialogRef<NewShiftDialogComponent>,
    private locationService: LocationService,
    public timeService: TimeService,
    @Inject(MAT_DIALOG_DATA) public data: {sheet: Sheet, shift: Shift}
    ) {
      this.loadEmployeeData();
      this.loadShiftData();
      this.employee.valueChanges.pipe(takeUntil(this.alive)).subscribe(this.loadEmployeeShifts.bind(this));
    }
}
