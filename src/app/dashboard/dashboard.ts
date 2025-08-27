import { Component, inject, OnInit, signal } from '@angular/core';
import {Router, RouterLink} from '@angular/router'
import { MemberService } from '../member-service';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit{
  private router = inject(Router);
  public memberService = inject(MemberService);
  user_name = signal<string|null>('');
  user_org = signal<string|null>('');

  ngOnInit(): void {
      this.user_name.set(localStorage.getItem('user_name'));
      this.user_org.set(localStorage.getItem('user_org'));
      this.memberService.loadmembers();
      this.memberService.oncreateTournament();
  }

  logout(){
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('match_id');
    localStorage.removeItem('tournament_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_org');
    localStorage.removeItem('team_score_card');
    this.router.navigateByUrl("/login");
  }

}
