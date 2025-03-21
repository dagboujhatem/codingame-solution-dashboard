import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { CheckoutService } from '../../../services/checkout.service';

@Component({
  selector: 'app-checkout',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  subscriptionId!: string;
  constructor(private route: ActivatedRoute,
    private checkoutService: CheckoutService) {

  }

  ngOnInit(): void {
    this.subscriptionId = this.route.snapshot.paramMap.get('id')!;
  }

  pay() {
    const priceId = 'price_1234567890abcdef';
    this.checkoutService.checkout(priceId);
  }
}
