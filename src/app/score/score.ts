import { Component, inject, signal } from '@angular/core';
import { Member, Supabase } from '../supabase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Team } from '../teams/teams';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
export interface Throw {
  memberId: string;
  throwNumber: number;
  score: number;
};
@Component({
  selector: 'app-score',
  imports: [RouterLink, FormsModule],
  templateUrl: './score.html',
  styleUrl: './score.css'
})
export class Score {
  private supabase = inject(Supabase);
  private snackBar = inject(MatSnackBar);
  private debounceTimer: any;
  selectedTeamSize = signal<number>(2);
  members =  signal<Member[]>([]);
  teams = signal<Team[]>([]);
  teamAssignment = signal<Record<string,string>>({});
  teamScoreCard = signal<Record<string,Throw[]>>({});
  async ngOnInit(): Promise<void> {
    await this.loadmembers();
    if(localStorage.getItem('match_id')){
      this.loadTeams();
    }
    // this.shuffleMembers();
  }

  teamAssigedToMember(memberId: string){
    const teamId = this.teamAssignment()[memberId];
    if(teamId){
      return teamId;
    }
    return '';
  }

  initialise(){
    //create teams
    const newTeams: Team[] = [];
    for (let i = 0; i < this.selectedTeamSize(); i++) {
      newTeams.push({
        id: i+'',
        name: i+'',
        members: [],
        totalScore: 0
      });
    }
    this.teams.set(newTeams);
    console.log(this.teams());
    //create team assignment
    let teamAssign: Record<string,string> = {};
    let memberInd = 0;
    this.members().forEach(member => {
      teamAssign[member.id]='';
      memberInd++;
    });
    this.teamAssignment.set(teamAssign);
    console.log(this.teamAssignment());
  }

  async loadmembers(){
    const result = await this.supabase.loadMembers();
    if(result.error){
      console.error(result.error);
      this.snackBar.open('Failed to load members', 'close', {duration: 2000, panelClass: ['global-snackbar']});
    }
    this.members.set(result);
    this.snackBar.open('Members loaded', 'close', {duration: 2000, panelClass:['global-snackbar']});
  }

  public removeDecimal(value: number): number{
    return Math.floor(value);
  }

  get teamIndexes(): number[] {
    return Array.from({ length: this.selectedTeamSize() }, (_, i) => i);
  }

  getTeamCharacter(index: number|string): string {
    if(typeof index === 'string'){
      return String.fromCharCode(65 + Number(index));
    }
    return String.fromCharCode(65 + index);
  }

  shuffleMembers(){
    const shuffledMembers = [...this.members()].sort(() => Math.random() - 0.5);
    const newTeams: Team[] = [];
    for (let i = 0; i < this.selectedTeamSize(); i++) {
      newTeams.push({
        id: i+'',
        name: i+'', // Team A, Team B, Team C
        members: [],
        totalScore: 0
      });
    }
    shuffledMembers.forEach((member, index) => {
      const teamIndex = index % this.selectedTeamSize();
      newTeams[teamIndex].members.push(member);
    });
    this.teams.set(newTeams);
    const newAssignments: Record<string, string> = {};
    newTeams.forEach(team => {
      team.members.forEach(member => {
        newAssignments[member.id] = team.name;
      });
    });
    this.teamAssignment.set(newAssignments);
    console.log(this.teams());
    console.log(this.teamAssignment());
    this.snackBar.open('Members Assigned to teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
  }

  getTeamMember(teamId: string): Member[]{
    const filteredTeam = this.teams().filter(i => i.name===teamId);
    if(filteredTeam.length>0){
      return filteredTeam[0].members;
    }
    return [];
  }
  async saveTeam(teams: Team[]){
    let countMember = 0;
    teams.forEach(team=>{
      countMember+=team.members.length;
    })
    if(countMember!=this.members().length){
      this.snackBar.open('All members not assigned to teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      return;
    }
    const result = await this.supabase.createMatch();
    if(result.error){
      console.log(result.error);
      this.snackBar.open('Failed to create Teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      return;
    }
    const resultAddTeam = await this.supabase.addTeam(teams);
    this.snackBar.open('Teams saved', 'close', {duration: 2000, panelClass: ['global-snackbar']});
    if(resultAddTeam.error){
      console.log(result.error);
      this.snackBar.open('Failed to create Teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
    }
  }

  onMemberTeamChange(member: Member, newTeamId: string): void {
    const currentTeams = this.teams();
    console.log('new Team Id: ', newTeamId);
    console.log('updated team assignment:', this.teamAssignment());
    //removing member from old team
    let updatedTeams = currentTeams.map(team => {
      const isMemberAlreadyInTeam = team.members.some(m => m.id === member.id);
      if (newTeamId && team.name != newTeamId && isMemberAlreadyInTeam) {
        return {
          ...team,
          members: team.members.filter(m => m.id !== member.id),
        };
      }
      return team;
    });
    //adding member to new team
    updatedTeams = updatedTeams.map(team => {
      if (newTeamId && team.name === newTeamId) {
        const isMemberAlreadyInTeam = team.members.some(m => m.id === member.id);
        if (!isMemberAlreadyInTeam) {
          return {
            ...team,
            members: [...team.members, member],
          };
        }
      }
      return team;
    });

    this.teams.set(updatedTeams);
    console.log('Updated Teams:', this.teams());
  }

  loadTeams(){
    const matchId = localStorage.getItem('match_id');
    if(!matchId){
      this.snackBar.open('No match found', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      return;
    }
    this.supabase.loadTeams(matchId, this.members()).then(result => {
      if(result.error){
        console.error(result.error);
        this.snackBar.open('Failed to load teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      }else{
        this.teams.set(result);
        let teamAssign: Record<string,string> = {};
        this.teams().forEach(team => {
          team.members.forEach(member => teamAssign[member.id] = team.name);
        });
        this.teamAssignment.set(teamAssign);
        this.selectedTeamSize.set(this.teams().length);
        // let loadedScoreCardTemp: Record<string,Throw[]>= JSON.parse(localStorage.getItem('team_score_card') || '{}');
        // let loadedScoreCardTemp = localStorage.getItem('team_score_card');
        this.loadScoreBoard().then(loadedScoreCardTemp=>{
          //create scorecard
            if(!loadedScoreCardTemp){
            this.teams().forEach(i=>{
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
              this.teamScoreCard.set(loadedScoreCardTemp);
            }
        });

      }
        // this.snackBar.open('Teams loaded', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      });
  }

  getMemberThrowScore(memberId: string, throwNumber: number): number {
    const teamScore = this.teamScoreCard()[this.teamAssigedToMember(memberId)];
    if(teamScore){
      const throwData = teamScore.find(t => t.memberId === memberId && t.throwNumber === throwNumber);
      return throwData ? throwData.score : 0;
    }
    return 0;
  }

  setMemberThrowScore(memberId: string, throwNumber: number, event: Event) {
    const teamScore = this.teamScoreCard()[this.teamAssigedToMember(memberId)];
    const input = event.target as HTMLInputElement;
    let scoreValue = parseInt(input.value, 10);
    scoreValue = isNaN(scoreValue) ? 0 : scoreValue;
    if(teamScore){
      const throwData = teamScore.find(t => t.memberId === memberId && t.throwNumber === throwNumber);
      if (throwData) {
      throwData.score = scoreValue;
      this.teamScoreCard.set({
        ...this.teamScoreCard(),
        [this.teamAssigedToMember(memberId)]: teamScore
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
    this.supabase.saveThrows(this.teamScoreCard(), this.teams()).then(result => {
    if(result.error){
      console.error(result.error);
    }else{
      console.log('Throws saved successfully');
    }
  });
  }

  async loadScoreBoard(): Promise<Record<string,Throw[]>|any>{
    const result = await this.supabase.loadScoreBoard(localStorage.getItem('match_id') ?? '', this.teams());
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
    const teamScore = this.teamScoreCard()[this.teamAssigedToMember(memberId)];
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
