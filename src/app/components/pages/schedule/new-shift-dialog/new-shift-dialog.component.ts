import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-new-shift-dialog',
  templateUrl: './new-shift-dialog.component.html',
  styleUrls: ['./new-shift-dialog.component.css']
})
export class NewShiftDialogComponent {

  email = new FormControl('', [Validators.required, Validators.email]);
  firstName = new FormControl('', [Validators.required]);
  lastName = new FormControl('', [Validators.required]);

  getEmailError(): string {
    if (this.email.hasError("required")) {
      return "Email is required";
    } else if (this.email.hasError("email")) {
      return "Not a valid email";
    } else {
      return "";
    }
  }

  getFirstNameError(): string {
    if (this.firstName.hasError("required")) {
      return "First name is required";
    } else {
      return "";
    }
  }

  getLastNameError(): string {
    if (this.lastName.hasError("required")) {
      return "Last name is required";
    } else {
      return "";
    }
  }

  submit(): void {
    this.dialogRef.close({
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      email: this.email.value
    } as Employee);
  }

  constructor(public dialogRef: MatDialogRef<NewShiftDialogComponent>) { }

}
