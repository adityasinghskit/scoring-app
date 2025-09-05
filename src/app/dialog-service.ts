import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmLeaveMatchDialogComponent } from './confirm-leave-match-dialog/confirm-leave-match-dialog';
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  constructor() { }

  openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmLeaveMatchDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        sessionStorage.removeItem('match_id');
        sessionStorage.removeItem('scoring_in_progress');
        this.router.navigate(['/members']);
      }
    });
  }
}
