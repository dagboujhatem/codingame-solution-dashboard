import { Component, signal, Signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { TabDirective, TabPanelComponent, TabsComponent, TabsContentComponent, TabsListComponent } from '@coreui/angular';
import { StateService } from '../../../services/state.service';
import { Subscription } from '../../../models/subscription.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    TabDirective,
    TabPanelComponent,
    TabsComponent,
    TabsContentComponent,
    TabsListComponent
  ],
  templateUrl: './pricing-plans.component.html',
  styleUrl: './pricing-plans.component.scss'
})
export class PricingPlansComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;
  unlimitedSubscriptions: Signal<Subscription[]>;
  limitedSubscriptions: Signal<Subscription[]>;
  readonly activeItem = signal(0);

  constructor(
    private stateService: StateService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.appName = this.stateService?.appName;
    this.supportMail = this.stateService?.supportMail;
    this.unlimitedSubscriptions = this.stateService?.unlimitedSubscriptions;
    this.limitedSubscriptions = this.stateService?.limitedSubscriptions;
  }

  handleActiveItemChange(value: string | number | undefined) {
    this.activeItem.set(<number>value);
  }

  onOrderNowClick(subscriptionId: string) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/checkout', subscriptionId]);
    } else {
      this.authService.setRedirectUrl(`/checkout/${subscriptionId}`);
      this.toastr.error('You must be logged in to proceed with the order.', 'Authentication Required');
      this.router.navigate(['/login']);
    }
  }
}
