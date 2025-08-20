import { inject, Injectable, signal } from '@angular/core';
import { Member, Supabase } from './supabase';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private supabase = inject(Supabase);
  private snackBar = inject(MatSnackBar);
  newMemberName = signal('');
  members = signal<Member[]>([]);
  async loadmembers(){
    const result = await this.supabase.loadMembers();
    if(result.error){
      console.error(result.error);
      this.snackBar.open('Failed to load members', 'close', {duration: 2000, panelClass: ['global-snackbar']});
    }
    this.members.set(result);
    this.snackBar.open('Members loaded', 'close', {duration: 2000, panelClass:['global-snackbar']});
  }
  async deleteMember(member: Member){
    const response = await this.supabase.removeMember(member.id);
    if(response.error){
      console.error(response.error);
      this.snackBar.open('Failed to delete members', 'close', {duration: 2000});
    }else{
      const prevMembers = this.members();
      this.members.set(prevMembers.filter(p=> p.id!=member.id));
      this.snackBar.open('Members deleted', 'close', {duration: 2000});
    }
  }

  async onAddMember(){
    const response = await this.supabase.addMember(this.newMemberName(), this.members());
    if(response.error){
      console.error(response.error);
      this.snackBar.open(response.error, 'close', {duration: 2000});
    }else{
      this.members.update(prev=> [response.newMember, ...prev]);
      this.newMemberName.set('');
      this.snackBar.open(`${response.newMember.name} added to the competition`, 'close', {duration: 2000});
    }
  }
  constructor() { }
}
