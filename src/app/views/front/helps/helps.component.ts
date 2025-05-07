import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'front-helps',
  templateUrl: './helps.component.html',
  styleUrls: ['./helps.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    BreadcrumbComponent
  ]
})
export class HelpsComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;
  youtubeLink: Signal<SafeResourceUrl>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService.appName;
    this.supportMail = this.stateService.supportMail;
    this.youtubeLink = this.stateService.youtubeLink;
  }
}
