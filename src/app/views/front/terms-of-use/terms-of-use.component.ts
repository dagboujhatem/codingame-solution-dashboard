import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';  
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-terms-of-use',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, BreadcrumbComponent],
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent {
  lastUpdated = '2025-05-10';
  appName: Signal<string>;
  supportMail: Signal<string>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService.appName;
    this.supportMail = this.stateService.supportMail;
  }
} 