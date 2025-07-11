import { Component, inject, OnInit, signal } from '@angular/core';
import { Member, Supabase } from '../supabase';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-members',
  imports: [RouterLink],
  templateUrl: './members.html',
  styleUrl: './members.css'
})
export class Members implements OnInit{
  private supabase = inject(Supabase);
  members =  signal<Member[]>([]);
  count: number = 1;
  ngOnInit(): void {
    this.count=1;
    this.loadmembers();
  }
  async loadmembers(){
    const result = await this.supabase.loadMembers();
    if(result.error){
      console.error(result.error);
    }else{
      this.members.set(result);
    }
  }
}
