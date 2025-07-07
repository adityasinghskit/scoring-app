import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';

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
  }
];
