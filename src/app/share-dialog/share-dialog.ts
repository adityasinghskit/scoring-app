import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    ClipboardModule
  ],
  templateUrl: './share-dialog.html',
  styleUrls: ['./share-dialog.css']
})
export class ShareDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { link: string },
    private snackBar: MatSnackBar
  ) {}

  copied() {
    this.snackBar.open('Link copied to clipboard!', 'Close', {
      duration: 2000
    });
  }
}
