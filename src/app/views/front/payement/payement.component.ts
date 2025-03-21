import { Component, CUSTOM_ELEMENTS_SCHEMA, Signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { TabsModule } from '@coreui/angular';
import { StateService } from '../../../services/state.service';
import { Subscription } from 'src/app/models/subscription.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payement',
  imports: [CommonModule, HeaderComponent, FooterComponent, TabsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payement.component.html',
  styleUrl: './payement.component.scss'
})
export class PayementComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;
  unlimitedSubscriptions: Signal<Subscription[]>;
  limitedSubscriptions: Signal<Subscription[]>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
    this.supportMail = this.stateService?.supportMail;
    this.unlimitedSubscriptions = this.stateService?.unlimitedSubscriptions;
    this.limitedSubscriptions = this.stateService?.limitedSubscriptions;
  }
}
