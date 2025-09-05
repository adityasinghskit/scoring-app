import { Component, inject, signal } from '@angular/core';
import { TeamService } from '../team-service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberService } from '../member-service';
import { ScoreService } from '../score-service';
import { DialogService } from '../dialog-service';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialog } from '../share-dialog/share-dialog';

@Component({
  selector: 'app-score',
  imports: [RouterLink, FormsModule],
  templateUrl: './score.html',
  styleUrl: './score.css'
})
export class Score { 
  public memberService = inject(MemberService);
  public teamService = inject(TeamService);
  public scoreService = inject(ScoreService);
  public dialogService = inject(DialogService);
  private activatedRoute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  matchId  = signal<string>('');
  async ngOnInit(): Promise<void> {
    this.scoreService.matchId.set(this.activatedRoute.snapshot.paramMap.get('matchId') || sessionStorage.getItem('match_id') || '');
    // await this.memberService.loadmembers();
    if(this.scoreService.matchId()){
      this.scoreService.loadTeams();
    }
  }

  openShareDialog() {
    this.dialog.open(ShareDialog, {
      width: '400px',
      data: { link: window.location.origin + '/dashboard/' + this.scoreService.matchId() }
    });
  }
}
