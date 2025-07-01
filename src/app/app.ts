import { Component } from '@angular/core';
import { Login } from "./login/login";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Login, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'scoring-app';
}
