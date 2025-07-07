import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from "./loader/loader";
import { LoaderService } from './loader-sevice';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Loader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  loaderService = inject(LoaderService);
  protected title = 'scoring-app';
}
