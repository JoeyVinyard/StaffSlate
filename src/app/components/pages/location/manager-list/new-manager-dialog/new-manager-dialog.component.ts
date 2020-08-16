import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-manager-dialog',
  templateUrl: './new-manager-dialog.component.html',
  styleUrls: ['./new-manager-dialog.component.css']
})
export class NewManagerDialogComponent {

  public email = new FormControl('', [Validators.required, Validators.email]);

  submit(): void {
    this.dialogRef.close(this.email.value);
  }

  public getEmailError(): string {
    if(this.email.hasError("required")) {
      return "Please provide an email!";
    } else if(this.email.hasError("email")) {
      return "Please enter a valid email!";
    } else {
      return "";
    }
  }

  constructor(public dialogRef: MatDialogRef<NewManagerDialogComponent>) { }

}
