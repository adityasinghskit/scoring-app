import { Component, inject, signal } from '@angular/core';
import { TeamService } from '../team-service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MemberService } from '../member-service';
import { ScoreService } from '../score-service';
import { DialogService } from '../dialog-service';

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
  async ngOnInit(): Promise<void> {
    // await this.memberService.loadmembers();
    if(localStorage.getItem('match_id')){
      this.scoreService.loadTeams();
    }
  }
}
