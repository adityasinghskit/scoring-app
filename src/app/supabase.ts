import { inject, Injectable, OnInit, signal } from '@angular/core';
import {
  AuthSession,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js'
import { environment } from '../environments/environment'
import { LoaderService } from './loader-sevice';
import { throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
export interface Member{
  id:string,
  name:string
}
@Injectable({
  providedIn: 'root'
})
export class Supabase{
  private loaderService = inject(LoaderService);
  private supabase: SupabaseClient;
  private snackBar = inject(MatSnackBar);
  user_id = signal('');
  _session: AuthSession | null = null
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    this.user_id.set(localStorage.getItem('user_id') || '');
  }
  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  async signup(email: string, password: string, name: string, organisation: string) {
    try {
      this.loaderService.show();

      // Hash password (in production, use proper hashing library like bcrypt)
      const hashedPassword = btoa(password); // Simple base64 encoding for demo

      const { data, error } = await this.supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            name,
            organisation
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: 'User with this email already exists' };
        }
        throw error;
      }

      localStorage.setItem('user_id', data.id);

      return {};
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error: error.message || 'Failed to create account' };
    } finally {
      this.loaderService.hide();
    }
  };

  async login(email: string, password: string){
    try {
      this.loaderService.show();

      const hashedPassword = btoa(password); // Simple base64 encoding for demo

      const { data, error } = await this.supabase
        .from('users')
        .select('id, name, email, organisation')
        .eq('email', email)
        .eq('password', hashedPassword)
        .single();

      if (error || !data) {
        return { error: 'Invalid email or password' };
      }

      localStorage.setItem('user_id', data.id);
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('user_org', data.organisation);

      return {};
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: 'Failed to login' };
    } finally {
      this.loaderService.hide();
    }
  };

  async loadMembers(): Promise<Member[]|any>{
    try {
      this.loaderService.show();
      const { data, error } = await this.supabase
        .from('members')
        .select('id, name')
        .eq('user_id', localStorage.getItem('user_id'));

      if (error || !data) {
        return { error: 'Error loading members' };
      };

      return data;
    } catch (error:any) {
      return { error: 'Error loading members' };
    } finally{
      this.loaderService.hide();
    }
  };

  async removeMember(id: string):Promise<any>{
    try {
      const { error } = await this.supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) return { error: 'Failed to remove member' };
      return {};
    } catch (error) {
      return { error: 'Failed to remove member' };
    }
  };

  async addMember(newMemberName:string, members: Member[]): Promise<any>{
    if (!newMemberName.trim()) {
      return {error: 'Please enter a member name'};
    }

    if (members.some(m => m.name.toLowerCase() === newMemberName.toLowerCase())) {
      return {error: 'A member with this name already exists'};
    }

    this.loaderService.show();
    try {
      const { data, error } = await this.supabase
        .from('members')
        .insert([
          {
            name: newMemberName.trim(),
            user_id: this.user_id()
          }
        ])
        .select()
        .single();

      if (error) return { error: 'Failed to add member' };

      const newMember = {
        id: data.id,
        name: data.name
      };
      return {newMember};
    } catch (error) {
      return {error: 'Error adding member:'};
    } finally {
      this.loaderService.hide();
    }
  }


}
