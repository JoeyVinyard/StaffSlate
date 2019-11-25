import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TimeSelectComponent } from 'src/app/components/utility/time-select/time-select.component';

@Component({
  selector: 'app-new-sheet-dialog',
  templateUrl: './new-sheet-dialog.component.html',
  styleUrls: ['./new-sheet-dialog.component.css']
})
export class NewSheetDialogComponent implements AfterViewInit {

  sheet: FormControl = new FormControl('', [Validators.required]);
  open: FormControl = new FormControl('', [Validators.required]);
  close: FormControl = new FormControl('', [Validators.required]);

  @ViewChild("openSheet", { static: true }) openField: TimeSelectComponent;
  @ViewChild("closeSheet", {static: true}) closeField: TimeSelectComponent;

  ngAfterViewInit() {
    this.open.valueChanges.subscribe(() => {
      this.close.updateValueAndValidity();
    });
    // this.sheet.valueChanges.subscribe((s: Sheet) => {
    //   this.open.setValue(s.openTime.hours + ":" + s.openTime.minutes)
    //   this.openField.setTime(s.openTime);

    //   this.close.setValue(s.openTime.hours+1 + ":" + s.openTime.minutes)
    //   this.closeField.setTime({hours: s.openTime.hours +1, minutes: 0});
    // });
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

  constructor() { }

}
