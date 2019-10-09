import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Employee } from 'src/app/models/employee';
import { LocationService } from 'src/app/services/location.service';
import { Location } from 'src/app/models/location';

@Component({
  selector: 'app-new-shift-dialog',
  templateUrl: './new-shift-dialog.component.html',
  styleUrls: ['./new-shift-dialog.component.css']
})
export class NewShiftDialogComponent {

  employee = new FormControl('', [Validators.required]);
  // firstName = new FormControl('', [Validators.required]);
  // lastName = new FormControl('', [Validators.required]);

  getEmployeeError(): string {
    if (this.employee.hasError("required")) {
      return "Please select an Employee";
    } else {
      return "";
    }
  }

  location: Location;

  submit(): void {
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
    private locationService: LocationService) {
      locationService.currentLocation.subscribe((location) => {
        this.location = location;
      });
    }

}
