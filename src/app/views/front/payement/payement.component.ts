import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { TabsModule } from '@coreui/angular';

@Component({
  selector: 'app-payement',
  imports: [HeaderComponent, FooterComponent, TabsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payement.component.html',
  styleUrl: './payement.component.scss'
})
export class PayementComponent {

}
