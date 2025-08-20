import { inject, Injectable, signal } from '@angular/core';
import { Supabase } from './supabase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemberService } from './member-service';
import { TeamService } from './team-service';

export interface Throw {
  memberId: string;
  throwNumber: number;
  score: number;
};

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private supabase = inject(Supabase);
  private snackBar = inject(MatSnackBar);
  private debounceTimer: any;
  public memberService = inject(MemberService);
  public teamService = inject(TeamService);
  teamScoreCard = signal<Record<string,Throw[]>>({});

  constructor() { }

  getMemberThrowScore(memberId: string, throwNumber: number): number {
    const teamScore = this.teamScoreCard()[this.teamService.teamAssigedToMember(memberId)];
    if(teamScore){
      const throwData = teamScore.find(t => t.memberId === memberId && t.throwNumber === throwNumber);
      return throwData ? throwData.score : 0;
    }
    return 0;
  }

  setMemberThrowScore(memberId: string, throwNumber: number, event: Event) {
    const teamScore = this.teamScoreCard()[this.teamService.teamAssigedToMember(memberId)];
    const input = event.target as HTMLInputElement;
    let scoreValue = parseInt(input.value, 10);
    scoreValue = isNaN(scoreValue) ? 0 : scoreValue;
    if(teamScore){
      const throwData = teamScore.find(t => t.memberId === memberId && t.throwNumber === throwNumber);
      if (throwData) {
      throwData.score = scoreValue;
      this.teamScoreCard.set({
        ...this.teamScoreCard(),
        [this.teamService.teamAssigedToMember(memberId)]: teamScore
      });
    }
    }
    localStorage.setItem('team_score_card', JSON.stringify(this.teamScoreCard()));
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.saveThrows();
      console.log('Updated Team Score Card:', this.teamScoreCard());
    }, 1000);
  }

  saveThrows(){
    this.supabase.saveThrows(this.teamScoreCard(), this.teamService.teams()).then(result => {
    if(result.error){
      console.error(result.error);
    }else{
      console.log('Throws saved successfully');
    }
  });
  }

  async loadScoreBoard(): Promise<Record<string,Throw[]>|any>{
    const result = await this.supabase.loadScoreBoard(localStorage.getItem('match_id') ?? '', this.teamService.teams());
      if(result.error){
        console.error(result.error);
        this.snackBar.open('Failed to load scoreboard', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      }
      else{
        localStorage.setItem('team_score_card', JSON.stringify(result));
        console.log('Loaded Scoreboard:', result);
        this.snackBar.open('Scoreboard loaded', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      }
      return result;
  }

  getMemberTotalScore(memberId: string): number {
    const teamScore = this.teamScoreCard()[this.teamService.teamAssigedToMember(memberId)];
    let totalScore=0;
    if(teamScore){
      const throwData: Throw[] = teamScore.filter(t => t.memberId === memberId);
      throwData.forEach(t => totalScore+=t.score);
      return totalScore;
    }
    return 0;
  }

  getTeamTotalScore(teamId: string): number {
    const teamScore = this.teamScoreCard()[teamId];
    let totalScore=0;
    if(teamScore){
      teamScore.forEach(t => totalScore+= t.score);
      return totalScore;
    }
    return 0;
  }
}
