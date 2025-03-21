import { Component, Signal } from '@angular/core';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'front-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  appName: Signal<string>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
  }
}
