import { Component, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NewShiftDialogComponent } from '../new-shift-dialog/new-shift-dialog.component';
import { Sheet } from 'src/app/models/sheet';

@Component({
  selector: 'app-new-sheet-dialog',
  templateUrl: './new-sheet-dialog.component.html',
  styleUrls: ['./new-sheet-dialog.component.css']
})
export class NewSheetDialogComponent implements AfterViewInit {

  sheet: FormControl = new FormControl('', [Validators.required]);
  open: FormControl = new FormControl('', [Validators.required]);
  close: FormControl = new FormControl('', [Validators.required]);
  timeIncrement: FormControl = new FormControl('', [Validators.required]);

  @ViewChild("openSheet", { static: true }) openField;
  @ViewChild("closeSheet", {static: true}) closeField;

  ngAfterViewInit() {
    this.open.valueChanges.subscribe(() => {
      this.close.updateValueAndValidity();
    });
  }

  submit(): void {
    this.dialogRef.close({
        label: this.sheet.value,
        openTime: this.open.value,
        closeTime: this.close.value,
        timeIncrement: this.timeIncrement.value
      } as Sheet
    );
  }

  private getSheetError(): string {
    if (this.sheet.hasError("required")) {
      return "Please name the Sheet";
    } else {
      return "";
    }
  }

  private getOpenError(): string {
    if (this.open.hasError("required")) {
      return "Please select a time";
    } else {
      return "";
    }
  }

  private getCloseError(): string {
    if (this.close.hasError("required")) {
      return "Please select a time";
    } else {
      return "";
    }
  }

  private getIncrementError(): string {
    if (this.timeIncrement.hasError("required")) {
      return "Please select a time increment";
    } else {
      return "";
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: {sheet:Sheet}, public dialogRef: MatDialogRef<NewShiftDialogComponent>) {
    if(data.sheet) {
      this.sheet.setValue(data.sheet.label);
      this.open.setValue(data.sheet.openTime);
      this.close.setValue(data.sheet.closeTime);
      this.timeIncrement.setValue(data.sheet.timeIncrement);
    }
  }

}
