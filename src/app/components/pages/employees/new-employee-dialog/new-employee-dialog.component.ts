import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Employee } from 'src/app/models/employee';
import { Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-new-employee-dialog',
  templateUrl: './new-employee-dialog.component.html',
  styleUrls: ['./new-employee-dialog.component.css']
})
export class NewEmployeeDialogComponent {

  email = new FormControl('', [Validators.email]);
  phone = new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]);
  firstName = new FormControl('', [Validators.required]);
  lastName = new FormControl('', [Validators.required]);

  enter(event: KeyboardEvent) {
    if(event.keyCode == 13) {
      this.submit();
    }
  }

  getEmailError(): string {
    if (this.email.hasError("email")) {
      return "Not a valid email";
    } else {
      return "";
    }
  }

  getPhoneError(): string {
    if(this.phone.hasError("minlength") || this.phone.hasError("maxlength") || isNaN(this.phone.value)) {
      return "Not a valid phone number"
    } else {
      return "";
    }
  }

  getFirstNameError(): string {
    if(this.firstName.hasError("required")) {
      return "First name is required";
    } else {
      return "";
    }
  }

  getLastNameError(): string {
    if(this.lastName.hasError("required")) {
      return "Last name is required";
    } else {
      return "";
    }
  }
  
  submit(): void {
    if(this.firstName.invalid || this.lastName.invalid || this.email.invalid || this.phone.invalid) {
      return;
    }
    this.dialogRef.close({
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      email: this.email.value
    } as Employee);
  }

  constructor(
    public dialogRef: MatDialogRef<NewEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {employee: Employee}
  ) {
    if(data.employee) {
      this.email.setValue(data.employee.email);
      this.firstName.setValue(data.employee.firstName);
      this.lastName.setValue(data.employee.lastName);
      this.email.setValue(data.employee.email);
    }
  }

}
