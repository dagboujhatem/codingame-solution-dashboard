import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'front-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  appName: Signal<string>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
  }
} 