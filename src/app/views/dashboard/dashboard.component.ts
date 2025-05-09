import { Component, OnInit } from '@angular/core';
import { WidgetsDropdownComponent } from './widgets-dropdown/widgets-dropdown.component';
import { CardComponent, CardBodyComponent } from '@coreui/angular';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [
    WidgetsDropdownComponent,
    CardComponent,
    CardBodyComponent,
    NgIf,
  ]
})
export class DashboardComponent implements OnInit {
  public isAdmin: boolean = false;

  constructor(private authService: AuthService) { 
  }

  async ngOnInit(): Promise<void> {
    this.isAdmin = await this.authService.authUserhasRole('Admin');
  }
}
