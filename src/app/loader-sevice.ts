import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private isLoadingSignal= signal<boolean>(false);

  isLoading = this.isLoadingSignal.asReadonly();

  constructor() { }

  show() {
    this.isLoadingSignal.set(true);
  }

  hide() {
    this.isLoadingSignal.set(false);
  }
}
