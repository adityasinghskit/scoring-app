import { inject, Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from '../environments/environment'
import { LoaderService } from './loader-sevice';
@Injectable({
  providedIn: 'root'
})
export class Supabase {
  private loaderService = inject(LoaderService);
  private supabase: SupabaseClient;
  _session: AuthSession | null = null
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
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

      return {};
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: 'Failed to login' };
    } finally {
      this.loaderService.hide();
    }
  };

}
