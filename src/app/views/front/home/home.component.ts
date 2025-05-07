import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { HomeHeaderComponent } from './home-header/home-header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HomeHeaderComponent, FooterComponent],
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