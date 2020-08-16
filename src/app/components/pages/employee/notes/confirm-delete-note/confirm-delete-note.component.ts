import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-note',
  templateUrl: './confirm-delete-note.component.html',
  styleUrls: ['./confirm-delete-note.component.css']
})
export class ConfirmDeleteNoteComponent {

  public closeDialog(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }

  constructor(private dialogRef: MatDialogRef<ConfirmDeleteNoteComponent>) { }

}
