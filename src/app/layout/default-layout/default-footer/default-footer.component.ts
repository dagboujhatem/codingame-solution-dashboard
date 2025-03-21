import { Component, Signal } from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { StateService } from '../../../services/state.service';

@Component({
    selector: 'app-default-footer',
    templateUrl: './default-footer.component.html',
    styleUrls: ['./default-footer.component.scss']
})
export class DefaultFooterComponent extends FooterComponent {
  appName: Signal<string>;

  constructor(private stateService: StateService) {
      super();
      this.appName = this.stateService?.appName;
  }
}
