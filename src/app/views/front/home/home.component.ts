import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { HomeHeaderComponent } from '../components/home-header/home-header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { ScrollToTopComponent } from '../components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HomeHeaderComponent, FooterComponent, ScrollToTopComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
    this.supportMail = this.stateService?.supportMail;
  }
} 