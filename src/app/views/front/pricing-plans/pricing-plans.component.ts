import { Component, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { 
  TabsModule,    
  TabDirective,
  TabPanelComponent,
  TabsComponent,
  TabsContentComponent,
  TabsListComponent } from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: 'front-pricing-plans',
  templateUrl: './pricing-plans.component.html',
  styleUrls: ['./pricing-plans.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    BreadcrumbComponent,
    TabsModule,
    TabDirective,
    TabPanelComponent,
    TabsComponent,
    TabsContentComponent,
    TabsListComponent
  ]
})
export class PricingPlansComponent {
  appName: Signal<string>;
  supportMail: Signal<string>;
  limitedSubscriptions: Signal<any[]>;
  unlimitedSubscriptions: Signal<any[]>;
  readonly activeItem = signal(0);

  constructor(
    private stateService: StateService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.appName = this.stateService.appName;
    this.supportMail = this.stateService.supportMail;
    this.limitedSubscriptions = this.stateService.limitedSubscriptions;
    this.unlimitedSubscriptions = this.stateService.unlimitedSubscriptions;
  }

  handleActiveItemChange(value: number | string | undefined) {
    this.activeItem.set(value as number);
  }

  onOrderNowClick(uid: string) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/checkout', uid]);
    } else {
      this.authService.setRedirectUrl(`/checkout/${uid}`);
      this.toastr.error('You must be logged in to proceed with the order.', 'Authentication Required');
      this.router.navigate(['/login']);
    }
  }
}
