import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../../services/state.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'front-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  appName: Signal<string>;
  isNavbarCollapsed = true;

  constructor(
    private stateService: StateService,
    private authService: AuthService
  ) {
    this.appName = this.stateService?.appName;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
