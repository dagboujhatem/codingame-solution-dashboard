import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../../services/state.service';

@Component({
  selector: 'front-header',
  standalone: true,
  imports: [RouterLink, CommonModule, ThemeSwitchComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  
  isAuthenticated = false;
  appName = this.stateService.appName;
  isNavbarCollapsed = true;

  ngOnInit() {
    // S'abonner aux changements d'état d'authentification
    this.authService.authState$.subscribe(state => {
      this.isAuthenticated = state;
    });
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
}
