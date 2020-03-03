import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-delete-manager-dialog',
  templateUrl: './delete-manager-dialog.component.html',
  styleUrls: ['./delete-manager-dialog.component.css']
})
export class DeleteManagerDialogComponent {

  submit(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: string, public dialogRef: MatDialogRef<DeleteManagerDialogComponent>) { }

}
