import { Component, ViewChild, AfterViewInit, Inject } from '@angular/core';
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

@Component({
  selector: 'app-new-shift-dialog',
  templateUrl: './new-shift-dialog.component.html',
  styleUrls: ['./new-shift-dialog.component.css']
})
export class NewShiftDialogComponent implements AfterViewInit {

  employee: FormControl = new FormControl('', [Validators.required]);
  shiftStart: FormControl = new FormControl('', [Validators.required]);
  shiftEnd = new FormControl('', [Validators.required]);
  location: Location;

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
    
  submit(): void {
    this.dialogRef.close({
      empId: this.employee.value.id,
      startTime: this.timeService.stringToTime(this.shiftStart.value),
      endTime: this.timeService.stringToTime(this.shiftEnd.value)
    } as Shift);
  }
  
  displayFn(emp: Employee): string {
    if(emp) {
      return emp.firstName + " " + emp.lastName;
    } else {
      return "";
    }
  }
  
  getNames(employees: Map<string, Employee>) {
    if(employees){
      let eName = typeof this.employee.value == "string" ? this.employee.value : this.displayFn(<Employee>this.employee.value);
      return Array.from(employees.values())
      .filter((e) => (e.firstName + " " + e.lastName).toLowerCase().includes(eName.toLowerCase()))
      .sort((a,b) => a.firstName.charCodeAt(0) - b.firstName.charCodeAt(0));
    } else {
      return [];
    }
  }
  
  ngAfterViewInit() {
    this.shiftStart.valueChanges.subscribe((val) => {
      this.shiftEnd.updateValueAndValidity();
    });
  }

  constructor(
    public dialogRef: MatDialogRef<NewShiftDialogComponent>,
    private locationService: LocationService,
    public timeService: TimeService,
    @Inject(MAT_DIALOG_DATA) public data: {sheet: Sheet, shift: Shift}
    ) {
      locationService.getCurrentLocation().subscribe((location) => {
        this.location = location;
      });
      if(data.shift) {
        this.location.getEmployees().subscribe((emps: Map<string, Employee>) => {
          this.employee.setValue(emps.get(data.shift.empId));
          this.shiftStart.setValue(this.timeService.timeToString(data.shift.startTime));
          this.shiftEnd.setValue(this.timeService.timeToString(data.shift.endTime));
        }).unsubscribe();
      } else {
        this.shiftStart.setValue(this.timeService.timeToString(this.data.sheet.openTime));
        this.shiftEnd.setValue(this.timeService.timeToString(this.data.sheet.closeTime));
      }
    }
}
