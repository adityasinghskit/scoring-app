import { Component, inject, OnInit, signal } from '@angular/core';
import {Router, RouterLink} from '@angular/router'
import { Member, Supabase } from '../supabase';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit{
  private router = inject(Router);
  private supabase = inject(Supabase);
  private snackBar = inject(MatSnackBar);
  members = signal<Member[]>([]);
  user_name = signal<string|null>('');
  user_org = signal<string|null>('');

  ngOnInit(): void {
      this.user_name.set(localStorage.getItem('user_name'));
      this.user_org.set(localStorage.getItem('user_org'));
      this.loadmembers();
  }

  logout(){
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    this.router.navigateByUrl("/login");
  }

  async loadmembers(){
    const result = await this.supabase.loadMembers();
    if(result.error){
      console.error(result.error);
    }
    this.members.set(result);
  }

}
