import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from 'src/app/models/note';

@Component({
  selector: 'app-new-note-dialog',
  templateUrl: './new-note-dialog.component.html',
  styleUrls: ['./new-note-dialog.component.css']
})
export class NewNoteDialogComponent {

  public title = new FormControl('', [Validators.required]);
  public content = new FormControl('', [Validators.required, Validators.maxLength(5000)]);

  public getTitleError(): string {
    if(this.title.hasError("required")) {
      return "Please enter a Title";
    } else {
      return "";
    }
  }

  public getContentError(): string {
    if(this.content.hasError("required")) {
      return "Please supply a note";
    } else if(this.content.hasError("maxLength")) {
      return "Note cannot be longer than 5000 characters";
    } else {
      return "";
    }
  }

  public submit(): void {
    if(this.title.invalid || this.content.invalid) {
      return;
    } else {
      this.dialogRef.close({
        title: this.title.value,
        content: this.content.value,
        timestamp: new Date()
      } as Note);
    }
  }

  enter(event: KeyboardEvent) {
    if(event.keyCode == 13) {
      this.submit();
    }
  }

  constructor(public dialogRef: MatDialogRef<NewNoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {note: [string, Note]}) {
    if(data.note) {
      this.title.setValue(data.note[1].title);
      this.content.setValue(data.note[1].content);
    }
  }

}
