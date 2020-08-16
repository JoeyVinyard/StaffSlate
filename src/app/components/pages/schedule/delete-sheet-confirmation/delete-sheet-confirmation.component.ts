import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-sheet-confirmation',
  templateUrl: './delete-sheet-confirmation.component.html',
  styleUrls: ['./delete-sheet-confirmation.component.css']
})
export class DeleteSheetConfirmationComponent {

  submit(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: string, public dialogRef: MatDialogRef<DeleteSheetConfirmationComponent>) { }
}
