import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Employee } from 'src/app/models/employee';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import * as convertTime from "convert-time";
import { Sheet } from 'src/app/models/sheet';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';
import { Shift } from 'src/app/models/shift';
import { Time } from '@angular/common';
import { NewShift } from 'src/app/models/new-shift';

@Component({
  selector: 'app-new-shift-dialog',
  templateUrl: './new-shift-dialog.component.html',
  styleUrls: ['./new-shift-dialog.component.css']
})
export class NewShiftDialogComponent implements AfterViewInit {

  employee = new FormControl('', [Validators.required]);
  sheet = new FormControl('', [Validators.required]);
  shiftStart = new FormControl('', [Validators.required]);
  shiftEnd = new FormControl('', [Validators.required]);

  @ViewChild("start", { static: true }) shiftStartField: NgxTimepickerFieldComponent;
  @ViewChild("end", {static: true}) shiftEndField: NgxTimepickerFieldComponent;

  ngAfterViewInit() {
    this.shiftStartField.registerOnChange((value: string) => {
      let incremented = this.changeByIncrement(this.shiftStart.value, convertTime(value));
      this.shiftStart.setValue(this.timeArrayToString(incremented));
      this.shiftStartField.minute = incremented[1];
    });
    this.shiftEndField.registerOnChange((value: string) => {
      let incremented = this.changeByIncrement(this.shiftEnd.value, convertTime(value));
      this.shiftEnd.setValue(this.timeArrayToString(incremented));
      this.shiftEndField.minute = incremented[1];
    });
    this.sheet.valueChanges.subscribe((s: Sheet) => {
      this.shiftStart.setValue(s.openTime.hours + ":" + s.openTime.minutes)
      this.shiftStartField.changeHour(s.openTime.hours);
      this.shiftStartField.changeMinute(s.openTime.minutes);

      this.shiftEnd.setValue(s.openTime.hours+1 + ":" + s.openTime.minutes)
      this.shiftEndField.changeHour(s.openTime.hours+1);
      this.shiftEndField.changeMinute(s.openTime.minutes);
    });
  }

  private timeArrayToString(time: number[]): string {
    return time.map((m) => {
      if(m < 10) {
        return "0"+m;
      }
      return m.toString()
    }).join(":");
  }

  private timeStringToObj(time: string): Time {
    let parts = time.split(":");
    return {
      hours: Number.parseInt(parts[0]),
      minutes: Number.parseInt(parts[1])
    } as Time;
  }

  private changeByIncrement(original: string, changed: string): number[] {
    original = original ? original : "00:00"
    let splitOriginal = original.split(":").map(m => Number.parseInt(m));
    let splitChanged = changed.split(":").map(m => Number.parseInt(m));
    let minutesOriginal = splitOriginal[1]
    let minutesNew = splitChanged[1];
    if(minutesOriginal < minutesNew) {
      minutesNew = (minutesOriginal + 30)%60;
    } else if(minutesOriginal > minutesNew) {
      minutesNew = Math.abs(minutesOriginal - 30)%60;
    } else {
      return splitChanged;
    }
    splitChanged[1] = minutesNew;
    return splitChanged;
  }

  getEmployeeError(): string {
    if (this.employee.hasError("required")) {
      return "Please select an Employee";
    } else {
      return "";
    }
  }

  getSheetError(): string {
    if (this.sheet.hasError("required")) {
      return "Please select a Sheet";
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
    } else if (this.shiftStart.value >= this.shiftEnd.value) {
      return "Shift must start before it ends"
    } else {
      return "";
    }
  }

  location: Location;

  submit(): void {
    this.dialogRef.close({
      shift: {
        empId: this.employee.value.id,
        startTime: this.timeStringToObj(this.shiftStart.value),
        endTime: this.timeStringToObj(this.shiftEnd.value)
      } as Shift,
      sheet: this.sheet.value
    } as NewShift);
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
      return Array.from(employees.values())
        .filter((e) => (e.firstName + " " + e.lastName).toLowerCase().includes(this.employee.value))
        .sort((a,b) => a.firstName.charCodeAt(0) - b.firstName.charCodeAt(0));
    } else {
      return [];
    }
  }

  constructor(
    public dialogRef: MatDialogRef<NewShiftDialogComponent>,
    private locationService: LocationService,
    @Inject(MAT_DIALOG_DATA) public sheets: Sheet[]
    ) {
      locationService.currentLocation.subscribe((location) => {
        this.location = location;
      });
    }

}
