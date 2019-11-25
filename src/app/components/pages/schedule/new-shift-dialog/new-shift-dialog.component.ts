import { Component, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Employee } from 'src/app/models/employee';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import { Sheet } from 'src/app/models/sheet';
import { Shift } from 'src/app/models/shift';
import { Time } from '@angular/common';
import { NewShift } from 'src/app/models/new-shift';
import { TimeSelectComponent } from 'src/app/components/utility/time-select/time-select.component';

@Component({
  selector: 'app-new-shift-dialog',
  templateUrl: './new-shift-dialog.component.html',
  styleUrls: ['./new-shift-dialog.component.css']
})
export class NewShiftDialogComponent implements AfterViewInit {

  employee: FormControl = new FormControl('', [Validators.required]);
  sheet: FormControl = new FormControl('', [Validators.required]);
  shiftStart: FormControl = new FormControl('', [Validators.required,
    (control: AbstractControl) => {
      if (this.sheet.value && this.compareTimesGT(this.sheet.value.openTime, control.value)) {
        return { "startTooEarly": true}
      }
      return {};
    }]
  );
  shiftEnd = new FormControl('', [Validators.required, 
    (control: AbstractControl) => {
        if (this.sheet.value && this.compareTimesGT(control.value, this.sheet.value.closeTime)) {
        return { "endTooLate": true };
      }
      return {};
    },
    (control: AbstractControl) => {
      if (this.shiftStart.value && this.compareTimesGTE(this.shiftStart.value, control.value)) {
        return { "overlap": true };
      }
      return {};
    },
  ]);

  @ViewChild("start", { static: true }) shiftStartField: TimeSelectComponent;
  @ViewChild("end", {static: true}) shiftEndField: TimeSelectComponent;

  ngAfterViewInit() {
    this.shiftStart.valueChanges.subscribe(() => {
      this.shiftEnd.updateValueAndValidity();
    });
    this.sheet.valueChanges.subscribe((s: Sheet) => {
      this.shiftStart.setValue(s.openTime.hours + ":" + s.openTime.minutes)
      this.shiftStartField.setTime(s.openTime);

      this.shiftEnd.setValue(s.openTime.hours+1 + ":" + s.openTime.minutes)
      this.shiftEndField.setTime({hours: s.openTime.hours +1, minutes: 0});
    });
  }

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
    } else if(this.shiftStart.hasError("startTooEarly")) {
      return "Cannot start before opening time!";
    } else {
      return "";
    }
  }

  getShiftEndError(): string {
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
        startTime: this.shiftStart.value,
        endTime: this.shiftEnd.value
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
