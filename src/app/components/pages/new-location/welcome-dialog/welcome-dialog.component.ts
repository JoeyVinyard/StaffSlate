import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.css']
})
export class WelcomeDialogComponent {

  public close(): void {
    this.dialogRef.close();
  }

  constructor(public dialogRef: MatDialogRef<WelcomeDialogComponent>) { }

}
