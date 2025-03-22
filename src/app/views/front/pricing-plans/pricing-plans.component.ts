import { Component, signal, Signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import {  TabDirective,
  TabPanelComponent,
  TabsComponent,
  TabsContentComponent,
  TabsListComponent } from '@coreui/angular';
import { StateService } from '../../../services/state.service';
import { Subscription } from 'src/app/models/subscription.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pricing-plans',
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, TabDirective,
    TabPanelComponent,
    TabsComponent,
    TabsContentComponent,
    TabsListComponent],
  templateUrl: './pricing-plans.component.html',
  styleUrl: './pricing-plans.component.scss'
})
export class PricingPlansComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;
  unlimitedSubscriptions: Signal<Subscription[]>;
  limitedSubscriptions: Signal<Subscription[]>;
  readonly activeItem = signal(0);

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
    this.supportMail = this.stateService?.supportMail;
    this.unlimitedSubscriptions = this.stateService?.unlimitedSubscriptions;
    this.limitedSubscriptions = this.stateService?.limitedSubscriptions;
  }


  handleActiveItemChange(value: string | number | undefined) {
    this.activeItem.set(<number>value);
  }
}
