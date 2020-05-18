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
  employees: Map<string,Employee>;
  employeeIds: string[];
  employee: FormControl = new FormControl('', [Validators.required]);
  shiftStart: FormControl = new FormControl('', [Validators.required]);
  shiftEnd = new FormControl('', [Validators.required]);

  @ViewChild("start", { static: true }) shiftStartField: NgxMaterialTimepickerComponent;
  @ViewChild("end", {static: true}) shiftEndField: NgxMaterialTimepickerComponent;

  private compareTimesGTE(t1: Time, t2: Time): boolean {
    //Returns true if t1 is greater than or equal to t2
    return (t1.hours > t2.hours || (t1.hours==t2.hours && t1.minutes>=t2.minutes));
  }
  
  private compareTimesGT(t1: Time, t2: Time): boolean {
    //Returns true if t1 is greater than t2
    return (t1.hours > t2.hours || (t1.hours==t2.hours && t1.minutes>t2.minutes));
  }
  
  getEmployeeError(): string {
    if (this.employee.hasError("required")) {
      return "Please select an Employee";
    } else {
      return "";
    }
  }
  
  getShiftStartError(): string {
    if (this.shiftStart.hasError("required")) {
      return "Please select a time";
    } else {
      return "";
    }
  }
  
  getShiftEndError(): string {
    if (this.shiftEnd.hasError("required")) {
      return "Please select a time";
    } else {
      return "";
    }
  }
    
  displayFn(empId: string): string {
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

  filterIds(): string[] {
    return this.employeeIds.filter((id) => {
      let employee = this.employees.get(id);
      return `${employee.firstName.toLowerCase()} ${employee.lastName.toLowerCase().includes(this.employee.value)}`;
    });
  }

  submit(): void {
    this.dialogRef.close({
      empId: this.employee.value,
      startTime: this.timeService.stringToTime(this.shiftStart.value),
      endTime: this.timeService.stringToTime(this.shiftEnd.value)
    } as Shift);
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
      locationService.getCurrentLocation().pipe(
        switchMap((location:Location) => location.getEmployees()),
        takeUntil(this.alive))
      .subscribe((employees) => {
        this.employees = employees;
        this.employeeIds = Array.from(employees.keys());
        if(data.shift) {
          this.employee.setValue(employees.get(data.shift.empId));
          this.shiftStart.setValue(this.timeService.timeToString(data.shift.startTime));
          this.shiftEnd.setValue(this.timeService.timeToString(data.shift.endTime));
        } else {
          this.shiftStart.setValue(this.timeService.timeToString(this.data.sheet.openTime));
          this.shiftEnd.setValue(this.timeService.timeToString(this.data.sheet.closeTime));
        }
      });
    }
}
