import { Component, Signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../../services/state.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent {
  appName: Signal<string>;
  scrolled = false;

  constructor(
    private stateService: StateService,
    private authService: AuthService
  ) {
    this.appName = this.stateService?.appName;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 10;
  }
} 