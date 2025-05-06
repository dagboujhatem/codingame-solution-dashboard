import { Component, Signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { StateService } from '../../../services/state.service';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-helps',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './helps.component.html',
  styleUrl: './helps.component.scss'
})
export class HelpsComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;
  youtubeLink: Signal<SafeResourceUrl>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
    this.supportMail = this.stateService?.supportMail;
    this.youtubeLink = this.stateService?.youtubeLink;
  }
}
