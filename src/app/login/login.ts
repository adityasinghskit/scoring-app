import { Component, inject, OnInit } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import { Supabase } from '../supabase';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit{
  private supabase = inject(Supabase);
  private router = inject(Router);
  loginErrorMessage: string | null = null;
  signupErrorMessage: string | null = null;
  showSignupPage: boolean = false;
  signupForm = new FormGroup({
    fullName: new FormControl('', {validators: [Validators.required]}),
    email: new FormControl('', {validators: [Validators.email, Validators.required]}),
    password: new FormControl('', {validators: [Validators.required, Validators.minLength(8)]}),
    organisation: new FormControl('', {validators: [Validators.required]})
  })

  loginForm = new FormGroup({
    loginEmail: new FormControl('', {validators: [Validators.email, Validators.required]}),
    loginPassword: new FormControl('', {validators: [Validators.required, Validators.minLength(8)]})
  })

  ngOnInit() {

  }

  toggleSignupLoginPage(){
    this.showSignupPage = !this.showSignupPage;
  }

  async onSignup(){
    const result = await this.supabase.signup(this.signupForm.controls.email.value || '', this.signupForm.controls.password.value || '',
      this.signupForm.controls.fullName.value || '', this.signupForm.controls.organisation.value || '');
      console.log(this.signupForm);
    if(result.error){
      this.signupErrorMessage = result.error;
    }else{
      // window.alert('User signed up!');
      this.router.navigate(['/dashboard']);
    }
  }

  async onLogin(){
    const result = await this.supabase.login(this.loginForm.controls.loginEmail.value || '', this.loginForm.controls.loginPassword.value || '');
    console.log(this.loginForm);
    if(result.error){
      this.loginErrorMessage = result.error;
    }else{

      // window.alert('User logged in!');
      this.router.navigate(['/dashboard']);
    }
  }



}
