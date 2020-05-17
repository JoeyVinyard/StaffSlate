import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-delete-employee-confirmation',
  templateUrl: './delete-employee-confirmation.component.html',
  styleUrls: ['./delete-employee-confirmation.component.css']
})
export class DeleteEmployeeConfirmationComponent {

  parseName(): string {
    return `${this.data.firstName.charAt(0).toUpperCase() + this.data.firstName.slice(1)} ${this.data.lastName.charAt(0).toUpperCase() + this.data.lastName.slice(1)}`
  }

  submit(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: Employee, public dialogRef: MatDialogRef<DeleteEmployeeConfirmationComponent>) {}
}
