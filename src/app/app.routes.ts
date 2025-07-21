import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Members } from './members/members';
import { Teams } from './teams/teams';
import { Score } from './score/score';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'prefix'
  },
  {
    path: 'home',
    component: Home,
    title: 'Dashboard'
  },
  {
    path: 'login',
    component: Login,
    title: 'Login'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard'
  },
  {
    path: 'members',
    component: Members,
    title: 'Member Managment'
  },
  {
    path: 'teams',
    component: Teams,
    title: 'Team Setup'
  },
  {
    path: 'score',
    component: Score,
    title: 'Score Board'
  }
];
