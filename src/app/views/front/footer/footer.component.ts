import { Component, Signal } from '@angular/core';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'front-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  appName: Signal<string>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
  }
}
