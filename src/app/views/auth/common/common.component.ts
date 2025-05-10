import { Component, Signal } from '@angular/core';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-common',
  imports: [],
  templateUrl: './common.component.html',
  styleUrl: './common.component.scss'
})
export class CommonComponent {
  appName: Signal<string>;

  constructor(private stateService: StateService) {
    this.appName = this.stateService?.appName;
  }
}
