import { Component, Signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-privacy-policy',
  imports: [HeaderComponent,FooterComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  supportMail: Signal<string>;

  constructor(private stateService: StateService) {
    this.supportMail = this.stateService?.supportMail;
  }
}
