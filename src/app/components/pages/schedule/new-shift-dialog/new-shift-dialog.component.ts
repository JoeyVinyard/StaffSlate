import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Employee } from 'src/app/models/employee';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';
import * as convertTime from "convert-time";
import { Sheet } from 'src/app/models/sheet';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';

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
  }

  private timeArrayToString(time: number[]): string {
    return time.map(m => m.toString()).join(":");
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
    } else {
      return "";
    }
  }

  location: Location;

  submit(): void {
    console.log(this.employee.value);
    console.log(this.sheet.value);
    console.log(this.shiftStart.value);
    console.log(this.shiftEnd.value);
    this.dialogRef.close({
      // firstName: this.firstName.value,
      // lastName: this.lastName.value,
      // email: this.email.value
    } as Employee);
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
