import { Component, Signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="home-header" [class.scrolled]="scrolled">
      <div class="container">
        <nav class="navbar navbar-expand-lg">
          <a class="navbar-brand" routerLink="/home">{{ appName() }}</a>
          <div class="ms-auto">
            <ng-container *ngIf="!isAuthenticated(); else authenticatedLinks">
              <a routerLink="/login" class="btn btn-outline-light me-2">Login</a>
              <a routerLink="/register" class="btn btn-primary">Register</a>
            </ng-container>
            <ng-template #authenticatedLinks>
              <a routerLink="/dashboard" class="btn btn-primary">My Account</a>
            </ng-template>
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .home-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: transparent;
      padding: 1rem 0;
      transition: background 0.3s, box-shadow 0.3s;
    }
    .home-header.scrolled {
      background: linear-gradient(90deg, var(--primary-color) 0%, #222 100%);
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    }
    .navbar {
      padding: 0;
    }
    .navbar-brand {
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
      text-decoration: none;
    }
    .btn {
      padding: 0.5rem 1.5rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-outline-light {
      border-width: 2px;
    }
    .btn-primary {
      background-color: white;
      color: var(--primary-color);
      border: none;
      &:hover {
        background-color: rgba(255, 255, 255, 0.9);
      }
    }
  `]
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