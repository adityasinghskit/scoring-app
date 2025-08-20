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
  }

  logout(){
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    this.router.navigateByUrl("/login");
  }

}
