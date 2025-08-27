import { inject, Injectable } from '@angular/core';
import { Team, TeamService } from './team-service';
import { ScoreService, Throw } from './score-service';
import { Member} from './supabase';
import { MemberService } from './member-service';
export type ResultsProps = {
  teams: Team[];
  throws: Throw[];
  onBack: () => void;
};
@Injectable({
  providedIn: 'root'
})
export class ResultService {
  public memberService = inject(MemberService);
  public scoreSevice = inject(ScoreService);
  public teamService = inject(TeamService);

  constructor() { }

  // Results({ teams, throws, onBack }: ResultsProps) {
  // const getTeamTotalScore = (team: Team) => {
  //   return team.members.reduce((sum, member) => {
  //     const memberThrows = throws.filter(t => t.memberId === member.id);
  //     return sum + memberThrows.reduce((memberSum, t) => memberSum + t.score, 0);
  //   }, 0);
  // };
  // }

  // getMemberStats(member: Member) {
  //   const memberThrows = throws.filter(t => t.memberId === member.id);
  //   const total = memberThrows.reduce((sum, t) => sum + t.score, 0);
  //   const throwCount = memberThrows.length;
  //   const average = throwCount > 0 ? (total / throwCount).toFixed(1) : '0.0';
  //   const bestThrow = throwCount > 0 ? Math.max(...memberThrows.map(t => t.score)) : 0;
    
  //   return { total, average: parseFloat(average), bestThrow, throwCount };
  // };

  // const teamsWithScores = teams.map(team => ({
  //   ...team,
  //   totalScore: getTeamTotalScore(team)
  // })).sort((a, b) => b.totalScore - a.totalScore);

  // // Get individual player rankings
  // const allMembers = teams.flatMap(team => 
  //   team.members.map(member => ({
  //     ...member,
  //     team: team.name,
  //     stats: getMemberStats(member)
  //   }))
  // ).sort((a, b) => b.stats.total - a.stats.total);

  // const highestSingleThrow = throws.length > 0 ? Math.max(...throws.map(t => t.score)) : 0;
  // const bestThrowMember = throws.find(t => t.score === highestSingleThrow);
  // const bestThrowPlayer = bestThrowMember ? 
  //   allMembers.find(m => m.id === bestThrowMember.memberId) : null;
}
