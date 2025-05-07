import { Component, effect, Signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';
import { INavData } from '@coreui/angular';
import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { SideBarService } from '../../services/side-bar.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    // IconDirective,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective
  ]
})
export class DefaultLayoutComponent {
  public navItems : INavData [] = [];
  navItemsSignal: Signal<INavData[]>;
  appName: Signal<string>;

  constructor(
    private sideBarService: SideBarService,
    private stateService: StateService
  ){
    this.navItemsSignal = this.sideBarService.getNavItemsSignal();
    this.appName = this.stateService.appName;
    effect(() => {
      this.navItems = this.navItemsSignal();
    });
  }
}
