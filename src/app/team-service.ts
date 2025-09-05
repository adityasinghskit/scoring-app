import { inject, Injectable, signal } from '@angular/core';
import { Member, Supabase } from './supabase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemberService } from './member-service';

export type Team = {
  id: string;
  name: string;
  members: Member[];
  totalScore: number;
};

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private supabase = inject(Supabase);
  private snackBar = inject(MatSnackBar);
  public memberService = inject(MemberService);
  selectedTeamSize = signal<number>(2);
  teams = signal<Team[]>([]);
  teamAssignment = signal<Record<string,string>>({});
  matchId = signal<string>('');

  constructor() {
    this.matchId.set(sessionStorage.getItem('match_id') ||'');
  }

  teamAssigedToMember(memberId: string){
    // console.log('teamAssigment', this.teamAssignment());
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
      this.memberService.members().forEach(member => {
        teamAssign[member.id]='';
      });
      this.teamAssignment.set(teamAssign);
      console.log(this.teamAssignment());
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
      const shuffledMembers = [...this.memberService.members()].sort(() => Math.random() - 0.5);
      const newTeams: Team[] = [];
      for (let i = 0; i < this.selectedTeamSize(); i++) {
        newTeams.push({
          id: i+'',
          name: i+'',
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
      if(sessionStorage.getItem('scoring_in_progress')){
        this.snackBar.open('Not allowed, Scoring in progress', 'close', {duration: 2000});
        return;
      }
      let countMember = 0;
      teams.forEach(team=>{
        countMember+=team.members.length;
      })
      if(countMember!=this.memberService.members().length){
        this.snackBar.open('All members not assigned to teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
        return;
      }
      const resultAddTeam = await this.supabase.addTeam(teams);
      this.snackBar.open('Teams saved', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      if(resultAddTeam.error){
        this.snackBar.open('Failed to create Teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
      }
    }
  
    onMemberTeamChange(member: Member, newTeamId: string): void {
      if(sessionStorage.getItem('scoring_in_progress')){
        this.snackBar.open('Not allowed, Scoring in progress', 'close', {duration: 2000});
        return;
      }
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
      const matchId = sessionStorage.getItem('match_id');
      if(!matchId){
        this.snackBar.open('No match found', 'close', {duration: 2000, panelClass: ['global-snackbar']});
        return;
      }
      this.supabase.loadTeams(matchId, this.memberService.members()).then(result => {
        if(result.error){
          console.error(result.error);
          this.snackBar.open('Failed to load teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
        }else{
          console.log('Loaded Teams:', result);
          this.teams.set(result);
          let teamAssign: Record<string,string> = {};
          this.teams().forEach(team => {
            console.log('Loaded Teams Inside:', team.name);
            team.members.forEach(member => teamAssign[member.id] = team.name);
          });
          this.teamAssignment.set(teamAssign);
          this.selectedTeamSize.set(this.teams().length);
          console.log('Team Assignments:', this.teamAssignment());
          this.snackBar.open('Teams loaded', 'close', {duration: 2000, panelClass: ['global-snackbar']});
        }
      });
    }
}
