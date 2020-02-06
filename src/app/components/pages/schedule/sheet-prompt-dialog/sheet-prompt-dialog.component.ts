import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-sheet-prompt-dialog',
  templateUrl: './sheet-prompt-dialog.component.html',
  styleUrls: ['./sheet-prompt-dialog.component.css']
})
export class SheetPromptDialogComponent {

  private close(): void {
    this.dialogRef.close();
  }

  constructor(public dialogRef: MatDialogRef<SheetPromptDialogComponent>) { }

}
