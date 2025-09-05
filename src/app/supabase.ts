import { inject, Injectable, OnInit, signal } from '@angular/core';
import {
  AuthSession,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js'
import { environment } from '../environments/environment'
import { LoaderService } from './loader-sevice';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Throw } from './score-service';
import { Team } from './team-service';
export interface Member{
  id:string,
  name:string
}

export interface TeamData{
  id: string;
  name: string;
  members: Member[];
  totalScore: number;
}
@Injectable({
  providedIn: 'root'
})
export class Supabase{
  private loaderService = inject(LoaderService);
  private supabase: SupabaseClient;
  private snackBar = inject(MatSnackBar);
  user_id = signal('');
  _session: AuthSession | null = null
  constructor() {
    this.user_id.set(sessionStorage.getItem('user_id') || '');
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }
  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  } 

  refreshUserId() {
    const id = sessionStorage.getItem('user_id') || '';
    this.user_id.set(id);
    console.log("User ID refreshed:", id);
  }

  async signup(email: string, password: string, name: string, organisation: string) {
    try {
      this.loaderService.show();

      // Hash password (in production, use proper hashing library like bcrypt)
      const hashedPassword = btoa(password); // Simple base64 encoding for demo

      const { data, error } = await this.supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            name,
            organisation
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: 'User with this email already exists' };
        }
        throw error;
      }

      sessionStorage.setItem('user_id', data.id);

      return {};
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error: error.message || 'Failed to create account' };
    } finally {
      this.loaderService.hide();
    }
  };

  async login(email: string, password: string){
    try {
      this.loaderService.show();

      const hashedPassword = btoa(password); // Simple base64 encoding for demo

      const { data, error } = await this.supabase
        .from('users')
        .select('id, name, email, organisation')
        .eq('email', email)
        .eq('password', hashedPassword)
        .single();

      if (error || !data) {
        return { error: 'Invalid email or password' };
      }

      sessionStorage.setItem('user_id', data.id);
      sessionStorage.setItem('user_email', data.email);
      sessionStorage.setItem('user_name', data.name);
      sessionStorage.setItem('user_org', data.organisation);
      this.refreshUserId();

      return {};
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: 'Failed to login' };
    } finally {
      this.loaderService.hide();
    }
  };

  async createTournament(): Promise<any> {
    try{
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('tournaments')
        .insert([{ user_id: sessionStorage.getItem('user_id'),
          name: 'tournament '+new Date().toISOString()
         }])
        .select()
        .single();

      if (error) return { error: 'Failed to create tournament' };
      sessionStorage.setItem('tournament_id',data.id);
      return data;
    }finally{
      this.loaderService.hide();
    }
  }

  async loadMembers(): Promise<Member[]|any>{
    try {
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('members')
        .select('*')
        .eq('user_id', this.user_id());

      if (error || !data) {
        return { error: 'Error loading members' };
      };
      return data;
    } catch (error:any) {
      return { error: 'Error loading members' };
    } finally{
      this.loaderService.hide();
    }
  };

  async loadMatches(): Promise<any>{
    try {
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('matches')
        .select('*')
        .eq('user_id', this.user_id())
        .order('inserted_at', { ascending: false });
      if (error || !data) {
        return { error: 'Error loading matches' };
      };
      return data;
    } catch (error:any) {
      return { error: 'Error loading matches' };
    } finally{
      this.loaderService.hide();
    }
  };

  async getTeams(matchId: string): Promise<any>{
    try {
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('teams')
        .select('*')
        .eq('match_id', matchId);

      if (error || !data) {
        return { error: 'Error loading teams' };
      };
      return data;
    } catch (error:any) {
      return { error: 'Error loading teams' };
    } finally{
      this.loaderService.hide();
    }
  };

  async getScoreCard(matchId: string): Promise<any>{
    try {
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('scorecards')
        .select('*')
        .eq('match_id', matchId);

      if (error || !data) {
        return { error: 'Error loading scorecards' };
      };
      return data;
    } catch (error:any) {
      return { error: 'Error loading scorecards' };
    } finally{
      this.loaderService.hide();
    }
  };

  async removeMember(id: string):Promise<any>{
    try {
      const { error } = await this.supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) return { error: 'Failed to remove member' };
      return {};
    } catch (error) {
      return { error: 'Failed to remove member' };
    }
  };

  async addMember(newMemberName:string, members: Member[]): Promise<any>{
    if (!newMemberName.trim()) {
      return {error: 'Please enter a member name'};
    }

    if (members.some(m => m.name.toLowerCase() === newMemberName.toLowerCase())) {
      return {error: 'A member with this name already exists'};
    }

    this.loaderService.show();
    try {
      const { data, error } = await this.supabase
        .from('members')
        .insert([
          {
            name: newMemberName.trim(),
            user_id: this.user_id()
          }
        ])
        .select()
        .single();

      if (error) return { error: 'Failed to add member' };

      const newMember = {
        id: data.id,
        name: data.name
      };
      return {newMember};
    } catch (error) {
      return {error: 'Error adding member:'};
    } finally {
      this.loaderService.hide();
    }
  }

  async createMatch(){
    try {
        this.loaderService.show();
        const { data, error } = await this.supabase
          .from('matches')
          .insert([{ user_id: sessionStorage.getItem('user_id'),
            tournament_id: sessionStorage.getItem('tournament_id')
           }])
          .select()
          .single();

        if (error) return { error: 'Failed to create match' };
        sessionStorage.setItem('match_id',data.id);
        return data;
    } catch (error) {
      return { error: 'Failed to create match' };
    } finally{
      this.loaderService.hide();
    }
  }

  async addTeam(newTeams: Team[]):Promise<any>{
    this.loaderService.show();
    if(!sessionStorage.getItem('match_id')){
      await this.createMatch();
    }
    const matchId = sessionStorage.getItem('match_id');
    try {
      // Delete existing teams for this match
      await this.supabase
        .from('teams')
        .delete()
        .eq('match_id', matchId);

      // Insert new teams
      const teamsToInsert = newTeams.map(team => ({
        name: team.name,
        members: team.members.map(m => m.id),
        match_id: matchId
      }));

      const { error } = await this.supabase
        .from('teams')
        .insert(teamsToInsert);

      if (error) return { error: 'Failed to add team' };

    } catch (error) {
      return {error: 'Error adding team:'};
    } finally {
      this.loaderService.hide();
    }
  }

  async loadTeams(matchId: string, members: Member[]): Promise<TeamData[]|any>{
    try {
      let memberNameRecord: Record<string, string> = {};
      members.forEach(mem => memberNameRecord[mem.id] = mem.name);
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('teams')
        .select('id, name, members')
        .eq('match_id', matchId);

      if (error) return { error: 'Failed to load team' };
      console.log('Loaded Teams:', data);

      let teamsWithMembers: TeamData[] = [];
       data.forEach(team => {
        let teamMembers: Member[]=[];
        team.members.forEach((memId: string) => {
          if (memberNameRecord[memId]) {
            teamMembers.push({ id: memId, name: memberNameRecord[memId] });
          }
        });
        teamsWithMembers.push({
        id: team.id,
        name: team.name,
        members: teamMembers,
        totalScore: 0
        })
      });
      return teamsWithMembers;
    } catch (error) {
      return {error: 'Error loading team'};
    } finally {
      this.loaderService.hide();
    }
  }
  
  async saveThrows(teamScoreCard: Record<string,Throw[]>, teams: Team[]): Promise<any>{
    if (!sessionStorage.getItem('match_id')) {
      return {error: 'No Match found'};
    }
    console.log("teamScoreCard: ", teamScoreCard["Team A"]);
    console.log("teams: ", JSON.stringify(teams));
    const currentMatchId = sessionStorage.getItem('match_id');
      // Delete existing scorecards for this match
      await this.supabase
        .from('scorecards')
        .delete()
        .eq('match_id', currentMatchId);

      let scorecards: any[]=[];
      teams.forEach((team) => {
      let throws: Throw[] = teamScoreCard[team.name];
      let teamScore = 0;
      throws.forEach(t=> teamScore += t.score);
      scorecards.push({
        match_id: currentMatchId,
        data: throws,
        total: teamScore,
        team_id: team.id
      });
      });
      try {
      // Insert new scorecard
      const { error } = await this.supabase
        .from('scorecards')
        .insert(
          scorecards
        );
      if (error) return {error: 'Error whilesaving throws'};
      return {};
    } catch (error) {
      return {error: 'Error while saving throws'};
    } finally {
    }
}

async loadScoreBoard(matchId: string, teams: Team[]): Promise<Record<string,Throw[]>|any>{
    try {
      let teamNameRecord: Record<string, string> = {};
      teams.forEach(team => teamNameRecord[team.id] = team.name);
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('scorecards')
        .select('match_id, team_id, data')
        .eq('match_id', matchId);

      if (error) return { error: 'Failed to load scoreboard' };
      console.log('Loaded scoreboard:', data);

      let loadedScoreBoard: Record<string,Throw[]> = {};
       data.forEach(score => {
        loadedScoreBoard[teamNameRecord[score.team_id]] = score.data;
      });
      return loadedScoreBoard;
    } catch (error) {
      return {error: 'Error loading scoreboard'};
    } finally {
      this.loaderService.hide();
    }
  }

}
