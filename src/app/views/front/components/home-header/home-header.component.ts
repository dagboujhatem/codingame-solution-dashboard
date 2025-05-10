import { Component, Signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../../services/state.service';
import { AuthService } from '../../../../services/auth.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeSwitchComponent],
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent {
  appName: Signal<string>;
  scrolled = false;
  isNavbarCollapsed = true;
  isAuthenticated = false;

  constructor(
    private stateService: StateService,
    private authService: AuthService
  ) {
      this.appName = this.stateService?.appName;
      // S'abonner aux changements d'état d'authentification
      this.authService.authState$.subscribe(state => {
        this.isAuthenticated = state;
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 10;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
} 