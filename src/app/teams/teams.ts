import { Component, inject, OnInit, signal } from '@angular/core';
import { Member, Supabase } from '../supabase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export type Team = {
  id: string;
  name: string;
  members: Member[];
  totalScore: number;
};
@Component({
  selector: 'app-teams',
  imports: [RouterLink, FormsModule],
  templateUrl: './teams.html',
  styleUrl: './teams.css'
})
export class Teams implements OnInit{
  private supabase = inject(Supabase);
  private snackBar = inject(MatSnackBar);
  selectedTeamSize = signal<number>(2);
  members =  signal<Member[]>([]);
  teams = signal<Team[]>([]);
  teamAssignment = signal<Record<string,string>>({});

  async ngOnInit(): Promise<void> {
    await this.loadmembers();
    this.initialise();
    this.shuffleMembers();
  }
  initialise(){
    //create teams
    const newTeams: Team[] = [];
    for (let i = 0; i < this.selectedTeamSize(); i++) {
      newTeams.push({
        id: i+'',
        name: `Team ${this.getTeamCharacter(i)}`, // Team A, Team B, Team C
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
      teamAssign[member.id]=memberInd%2==0?0+'':1+'';
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

  getTeamCharacter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  shuffleMembers(){
    const shuffledMembers = [...this.members()].sort(() => Math.random() - 0.5);
    const newTeams: Team[] = [];
    for (let i = 0; i < this.selectedTeamSize(); i++) {
      newTeams.push({
        id: i+'',
        name: `Team ${this.getTeamCharacter(i)}`, // Team A, Team B, Team C
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
        newAssignments[member.id] = team.id;
      });
    });
    this.teamAssignment.set(newAssignments);
    console.log(this.teams());
    console.log(this.teamAssignment());
    this.snackBar.open('Members Assigned to teams', 'close', {duration: 2000, panelClass: ['global-snackbar']});
  }

  getTeamMember(teamId: string): Member[]{
    const filteredTeam = this.teams().filter(i => i.id===teamId);
    if(filteredTeam.length>0){
      return filteredTeam[0].members;
    }
    return [];
  }
  async saveTeam(teams: Team[]){
    const result = await this.supabase.createMatch();
    if(result.error){
      console.log(result.error);
    }
    const resultAddTeam = await this.supabase.addTeam(teams);
    if(resultAddTeam.error){
      console.log(result.error);
    }
  }
}
