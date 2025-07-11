import { Component, inject, OnInit, signal } from '@angular/core';
import { Member, Supabase } from '../supabase';
import { RouterLink } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar'
@Component({
  selector: 'app-members',
  imports: [RouterLink],
  templateUrl: './members.html',
  styleUrl: './members.css'
})
export class Members implements OnInit{
  private supabase = inject(Supabase);
  private snackBar = inject(MatSnackBar);
  members =  signal<Member[]>([]);
  ngOnInit(): void {
    this.loadmembers();
  }
  async loadmembers(){
    const result = await this.supabase.loadMembers();
    if(result.error){
      console.error(result.error);
      this.snackBar.open('Failed to load members', 'close', {duration: 2000});
    }
    this.members.set(result);
    this.snackBar.open('Members loaded', 'close', {duration: 2000});
  }
  async deleteMember(member: Member){
    const response = await this.supabase.removeMember(member.id);
    if(response.error){
      console.error(response.error);
      this.snackBar.open('Failed to delete members', 'close', {duration: 2000});
    }
    const prevMembers = this.members();
    this.members.set(prevMembers.filter(p=> p.id!=member.id));
    this.snackBar.open('Members deleted', 'close', {duration: 2000});
  }
}
