import { Component, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NewShiftDialogComponent } from '../new-shift-dialog/new-shift-dialog.component';
import { Sheet } from 'src/app/models/sheet';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-new-sheet-dialog',
  templateUrl: './new-sheet-dialog.component.html',
  styleUrls: ['./new-sheet-dialog.component.css']
})
export class NewSheetDialogComponent implements AfterViewInit {

  public sheet: FormControl = new FormControl('', [Validators.required]);
  public open: FormControl = new FormControl('12:00 am', [Validators.required]);
  public close: FormControl = new FormControl('11:00 pm', [Validators.required]);
  public timeIncrement: FormControl = new FormControl(30, [Validators.required]);

  @ViewChild("openSheet", { static: true }) openField;
  @ViewChild("closeSheet", {static: true}) closeField;

  public enter(event: KeyboardEvent) {
    if(event.keyCode == 13) {
      this.submit();
    }
  }

  public submit(): void {
    if(this.sheet.invalid || this.open.invalid || this.close.invalid || this.timeIncrement.invalid) {
      return;
    }
    this.dialogRef.close({
        label: this.sheet.value,
        openTime: this.timeService.stringToTime(this.open.value),
        closeTime: this.timeService.stringToTime(this.close.value),
        timeIncrement: this.timeIncrement.value
      } as Sheet
    );
  }

  public getSheetError(): string {
    if (this.sheet.hasError("required")) {
      return "Please name the Sheet";
    } else {
      return "";
    }
  }

  public getOpenError(): string {
    if (this.open.hasError("required")) {
      return "Please select a time";
    } else {
      return "";
    }
  }

  public getCloseError(): string {
    if (this.close.hasError("required")) {
      return "Please select a time";
    } else {
      return "";
    }
  }

  public getIncrementError(): string {
    if (this.timeIncrement.hasError("required")) {
      return "Please select a time increment";
    } else {
      return "";
    }
  }

  ngAfterViewInit() {
    this.open.valueChanges.subscribe(() => {
      this.close.updateValueAndValidity();
    });
  }

  constructor(
    public dialogRef: MatDialogRef<NewShiftDialogComponent>,
    public timeService: TimeService,
    @Inject(MAT_DIALOG_DATA) public data: {sheet:Sheet})
  {
    if(data.sheet) {
      this.sheet.setValue(data.sheet.label);
      this.open.setValue(timeService.timeToString(data.sheet.openTime));
      this.close.setValue(timeService.timeToString(data.sheet.closeTime));
      this.timeIncrement.setValue(data.sheet.timeIncrement);
      this.timeIncrement.disable();
    }
  }

}
