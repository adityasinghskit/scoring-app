import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../member-service';
import { TeamService } from '../team-service';
import { DialogService } from '../dialog-service';

@Component({
  selector: 'app-teams',
  imports: [RouterLink, FormsModule],
  templateUrl: './teams.html',
  styleUrl: './teams.css'
})
export class Teams implements OnInit{
  public memberService = inject(MemberService);
  public teamService = inject(TeamService);
  public dialogService = inject(DialogService);
  async ngOnInit(): Promise<void> {
    if(localStorage.getItem('match_id')){
      this.teamService.loadTeams();
    }else{
      this.teamService.initialise();
    }
    // this.shuffleMembers();
  }

}
