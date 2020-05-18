import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { Schedule } from 'src/app/models/schedule';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Identifier } from 'src/app/models/identifier';

@Component({
  selector: 'app-new-schedule-dialog',
  templateUrl: './new-schedule-dialog.component.html',
  styleUrls: ['./new-schedule-dialog.component.css']
})
export class NewScheduleDialogComponent {

  label = new FormControl('', [Validators.required]);

  enter(event: KeyboardEvent) {
    if(event.keyCode == 13) {
      this.submit();
    }
  }

  getLabelError(): string {
    if (this.label.hasError("required")) {
      return "Label is required";
    } else {
      return "";
    }
  }

  submit(): void {
    if(this.label.invalid) {
      return;
    }
    this.dialogRef.close({
      label: this.label.value
    } as Schedule);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: Identifier, public dialogRef: MatDialogRef<NewScheduleDialogComponent>) {
    if(data) {
      this.label.setValue(data.display);
    }
  }

}
