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
  shiftEnd = new FormControl('', [Validators.required, 
    (control: AbstractControl) => {
      let t = this.timeStringToObj(control.value);
      if (this.sheet.value
        && (t.hours >= (<Sheet>this.sheet.value).closeTime.hours && t.minutes > (<Sheet>this.sheet.value).closeTime.minutes
        || t.hours > (<Sheet>this.sheet.value).closeTime.hours)) {
        return { "endTooLate": true };
      }
      return {};
    },
    (control: AbstractControl) => {
      if (this.shiftStart.value && this.compareTimes(this.shiftStart.value, control.value)) {
        return { "overlap": true };
      }
      return {};
    },
  ]);

  @ViewChild("start", { static: true }) shiftStartField: NgxTimepickerFieldComponent;
  @ViewChild("end", {static: true}) shiftEndField: NgxTimepickerFieldComponent;

  ngAfterViewInit() {
    this.shiftStartField.registerOnChange((value: string) => {
      let incremented = this.changeByIncrement(this.shiftStart.value, convertTime(value));
      this.shiftStart.setValue(this.timeToString(incremented));
      if(this.shiftStartField.minute != incremented.minutes) {
        this.shiftStartField.changeMinute(incremented.minutes);
      }
    });
    this.shiftEndField.registerOnChange((value: string) => {
      let incremented = this.changeByIncrement(this.shiftEnd.value, convertTime(value));
      this.shiftEnd.setValue(this.timeToString(incremented));
      if(this.shiftEndField.minute != incremented.minutes) {
        this.shiftEndField.changeMinute(incremented.minutes);
      }
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

  private timeToString(time: Time): string {
    return `${time.hours}:${time.minutes}`;
  }

  private timeToNumber(time: Time): number {
    return time.hours * 100 + time.minutes;
  }

  private timeStringToObj(time: string): Time {
    let parts = time.split(":");
    return {
      hours: Number.parseInt(parts[0]),
      minutes: Number.parseInt(parts[1])
    } as Time;
  }

  private buildTimeFromString(time: string): Time {
    let split = time.split(":").map(m => Number.parseInt(m));
    return {
      hours: split[0],
      minutes: split[1]
    } as Time;
  }

  private changeByIncrement(original: string, changed: string): Time {
    original = original ? original : "00:00"
    let o = this.buildTimeFromString(original);
    let c = this.buildTimeFromString(changed);
    if(o.minutes == c.minutes) {
      c.minutes = o.minutes;
      return c;
    } else if(o.minutes - c.minutes < 0) {
      c.minutes = o.minutes + (<Sheet>this.sheet.value).timeIncrement;
    } else {
      c.minutes = o.minutes - (<Sheet>this.sheet.value).timeIncrement;
    }
    c.minutes = c.minutes%60;
    return c;
  }

  private compareTimes(t1: string, t2: string): boolean {
    let to1 = this.timeStringToObj(t1);
    let to2 = this.timeStringToObj(t2);
    return (to1.hours > to2.hours || (to1.hours==to2.hours && to1.minutes>=to2.minutes));
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
    let t = this.timeStringToObj(this.shiftEnd.value);
    if (this.shiftEnd.hasError("required")) {
      return "Please select a time";
    } else if (this.shiftEnd.hasError("endTooLate")) {
      return "Shift cannot end after closing time";
    } else if (this.shiftEnd.hasError("overlap")) {
      return "Shift must start before it ends";
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
