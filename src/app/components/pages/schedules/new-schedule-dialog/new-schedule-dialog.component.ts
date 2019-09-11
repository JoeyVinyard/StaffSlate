import { Component, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { Schedule } from 'src/app/models/schedule';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-new-schedule-dialog',
  templateUrl: './new-schedule-dialog.component.html',
  styleUrls: ['./new-schedule-dialog.component.css']
})
export class NewScheduleDialogComponent {

  label = new FormControl('', [Validators.required]);

  getLabelError(): string {
    if (this.label.hasError("required")) {
      return "Label is required";
    } else {
      return "";
    }
  }

  submit(): void {
    this.dialogRef.close({
      label: this.label.value
    } as Schedule);
  }

  constructor(public dialogRef: MatDialogRef<NewScheduleDialogComponent>) { }

}
