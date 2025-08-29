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

  getMemberThrowScore(memberId: string, throwNumber: number): number | null {
    // console.log('Get Member Throw Score Called for memberId:', memberId, 'throwNumber:', throwNumber);
    // console.log('Current Team Score Card State:', this.teamScoreCard());
    const teamScore = this.teamScoreCard()[this.teamService.teamAssigedToMember(memberId)];
    // console.log('Team Score Data:', teamScore);
    if(teamScore){
      const throwData = teamScore.find(t => t.memberId === memberId && t.throwNumber === throwNumber);
      return throwData ? throwData.score : null;
    }
    return null;
  }

  setMemberThrowScore(memberId: string, throwNumber: number, event: Event) {
    throwNumber ??= 0;
    if(!localStorage.getItem('scoring_in_progress')){
      localStorage.setItem('scoring_in_progress', 'true');
    }
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
    // localStorage.setItem('team_score_card', JSON.stringify(this.teamScoreCard()));
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.saveThrows();
      console.log('Updated Team Score Card:', this.teamScoreCard());
    }, 1000);
  }

  saveThrows(){
    if(!localStorage.getItem('scoring_in_progress')){
      localStorage.setItem('scoring_in_progress', 'true');
    }
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
        // localStorage.setItem('team_score_card', JSON.stringify(result));
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

  loadTeams(){
    const matchId = localStorage.getItem('match_id');
    const teams = this.teamService.teams();
    if(!matchId){
      this.snackBar.open('No match found', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      return;
    }
    console.log('load teams 1');
    this.supabase.loadTeams(matchId, this.memberService.members()).then(result => {
      if(result.error){
        console.error(result.error);
        this.snackBar.open('Failed to load teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      }else{
        this.teamService.teams.set(result);
        let teamAssign: Record<string,string> = {};
        teams.forEach(team => {
          team.members.forEach(member => teamAssign[member.id] = team.name);
        });
        this.teamService.teamAssignment.set(teamAssign);
        this.teamService.selectedTeamSize.set(this.teamService.teams().length);
        console.log('load teams 2');
        this.loadScoreBoard().then(loadedScoreCardTemp=>{
          console.log('Loaded Score Card Inside:', loadedScoreCardTemp);
          //create scorecard
            if(Object.keys(loadedScoreCardTemp).length === 0){
            console.log('Loaded Score Card Inside Inside:', loadedScoreCardTemp);
            // console.log('Teams: '+ JSON.stringify(teams));
            teams.forEach(i=>{
              let teamScoreCardTemp = signal<Record<string,Throw[]>>({});
              let memberScoreCard: Throw[] = [];
              i.members.forEach(i=> {
                for(let j=1;j<4;j++){
                memberScoreCard.push({
                  memberId: i.id,
                  throwNumber: j,
                  score: 0
                });
              }
              })
              teamScoreCardTemp()[i.name]=memberScoreCard;
              this.teamScoreCard.set({...this.teamScoreCard(), ...teamScoreCardTemp()});
            })
            console.log('Team Score Card: ', this.teamScoreCard());
            }else{
              console.log('load teams 3');
              this.teamScoreCard.set(loadedScoreCardTemp);
            }
        });
      }
      });
  }
}
