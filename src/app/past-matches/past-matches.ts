import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../team-service';
import { NgFor } from '@angular/common';
import { Supabase } from '../supabase';
import { DatePipe } from '@angular/common';
import { NgStyle } from '@angular/common';

export type Member = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  members: string[];
  match_id: string;
};

export type Match = {
  id: string;
  inserted_at: string;
};

export type Scorecard = {
  id: string;
  match_id: string;
  total: number;
  data: any;
  team_id: string;
};

export type MatchSummary = {
  match: Match;
  teams: Team[];
  scorecards: Scorecard[];
  members: Member[];
};

export type PastMatchesProps = {
  onBack: () => void;
};
@Component({
  selector: 'app-past-matches',
  imports: [RouterLink, NgFor, DatePipe, NgStyle],
  templateUrl: './past-matches.html',
  styleUrl: './past-matches.css'
})
export class PastMatches implements OnInit {
  private snackBar = inject(MatSnackBar);
  private supabaseService = inject(Supabase);
  public teamService = inject(TeamService);
  matches: Match[] =[];
  pastMatches: MatchSummary[] = [];
  loading = false;
  user_id = signal('');

  ngOnInit(): void {
    this.loadPastMatches();
  }
  constructor() {
    this.user_id.set(localStorage.getItem('user_id') || '');
  }

  async loadPastMatches(){
    // console.log('Loading past matches for user:', this.user_id());
    if (!this.user_id) return;

    try {
      this.loading = true;
      // Load all matches for this user
      const matches = await this.supabaseService.loadMatches();
      if(matches.error){throw new Error(matches.error);}
      this.matches.push(...matches);
      console.log('Matches:', matches);

      // Load all members for this user
      const members = await this.supabaseService.loadMembers();
      if(members.error){throw new Error(members.error);}
      console.log('Members:', members);
      const matchSummaries: MatchSummary[] = [];

      for (const match of matches || []) {
        // Load teams for this match
        const teams = await this.supabaseService.getTeams(match.id);
        // console.log('Teams:', teams);
        if (teams.error) throw new Error(teams.error);

        // Load scorecards for this match
        let scorecards = await this.supabaseService.getScoreCard(match.id);

        if (scorecards.error) throw new Error(scorecards.error);
        scorecards = scorecards.sort((a:any, b:any) => b.total - a.total);
        matchSummaries.push({
          match,
          teams: teams || [],
          scorecards: scorecards || [],
          members: members || []
        });
      }
      console.log('Match Summary:', matchSummaries);
      this.pastMatches.push(...matchSummaries);
    } catch (error) {
      console.error('Error loading past matches:', error);
      this.snackBar.open('Failed to load past matches', 'close', {duration: 2000});
    } finally {
      this.loading=false;
    }
  };

  getMemberName (memberId: string, members: Member[])  {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown';
  };

  getTeamScore (teamId: string, scorecards: Scorecard[]) {
    return scorecards
      .filter(sc => sc.data?.teamId === teamId)
      .reduce((sum, sc) => sum + sc.total, 0);
  };

  getMemberScores (teamMembers: string[], scorecards: Scorecard[]): any[]  {
    // const result: Record<string, any> = {};
    return teamMembers.map(memberId => {
      let memberTotal = 0;
      scorecards.forEach(sc => {
        sc.data.forEach((throwItem: { memberId: string; score: number; }) => {
        if(throwItem.memberId === memberId){
        memberTotal += throwItem.score;
      }})});
      // const total = memberScores.reduce((sum, sc) => sum + sc.total, 0);
      return { total: memberTotal, memberId, };
    });
    // return result;
  };

  getTeamName(teamId: string, teams: Team[]) {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Unknown';
  }

  getMemberCount(teamId: string, teams: Team[]) {
    const team = teams.find(t => t.id === teamId);
    return team?.members.length || 0;
  }

  getMatchCount(){
    return this.matches.length;
  }

}
