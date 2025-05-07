import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'front-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    BreadcrumbComponent
  ]
})
export class PrivacyPolicyComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService.appName;
    this.supportMail = this.stateService.supportMail;
  }
}
