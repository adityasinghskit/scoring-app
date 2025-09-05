import { Component, inject, OnInit, signal } from '@angular/core';
import {Router, RouterLink} from '@angular/router'
import { MemberService } from '../member-service';
import { TeamService } from '../team-service';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit{
  private router = inject(Router);
  public memberService = inject(MemberService);
  public teamService = inject(TeamService);
  user_name = signal<string|null>('');
  user_org = signal<string|null>('');

  ngOnInit(): void {
      this.user_name.set(sessionStorage.getItem('user_name'));
      this.user_org.set(sessionStorage.getItem('user_org'));
      this.memberService.loadmembers();
      this.memberService.oncreateTournament();
      this.teamService.loadTeams();
  }

  logout(){
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_email');
    sessionStorage.removeItem('match_id');
    sessionStorage.removeItem('tournament_id');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_org');
    sessionStorage.removeItem('team_score_card');
    this.router.navigateByUrl("/login");
  }

}
