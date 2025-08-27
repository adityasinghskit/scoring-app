import { Component } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogTitle, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-leave-match-dialog',
  template: `
    <h2 mat-dialog-title>Leave Current Match?</h2>
    <mat-dialog-content>
      <p>Do you want to leave the current match?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">No</button>
      <button mat-raised-button color="primary" (click)="onYesClick()">Yes</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatDialogActions, MatButtonModule]
})
export class ConfirmLeaveMatchDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmLeaveMatchDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
