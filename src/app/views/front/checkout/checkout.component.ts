import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../../services/checkout.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from '../../../models/subscription.interface';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  private subscriptionId!: string;
  public subscriptionData!: Subscription;
  private stripePromise: Promise<Stripe | null>;
  public paymentError: string | null = null;
  public loading = false;
  @ViewChild('cardElement', { static: false }) cardElementRef: ElementRef | undefined;
  private cardElement: any;
  public cardValid: boolean = false;

  constructor(private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private checkoutService: CheckoutService) {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  ngOnInit(): void {
    this.subscriptionId = this.route.snapshot.paramMap.get('id')!;
    this.checkoutService.getSubscription(this.subscriptionId)
      .then((subscriptionDoc: any) => {
        if (!subscriptionDoc.exists()) {
          return;
        }
        const subData: Subscription = subscriptionDoc.data();
        this.subscriptionData = subData;
      });
  }

  ngAfterViewInit(): void {
    if (this.cardElementRef) {
      this.stripePromise.then((stripe: any) => {
        const elements = stripe.elements();
        this.cardElement = elements.create('card');
        this.cardElement.mount(this.cardElementRef?.nativeElement);
        this.cardElement.on('change', (event: any) => {
          this.cardValid = event.complete;
        });
      });
    }
  }

  pay() {
    if (!this.cardElement || !this.cardValid) {
      return;
    }

    this.loading = true;
    this.paymentError = null;

    this.checkoutService.checkout(this.subscriptionData.stripeProductId)
      .subscribe(async (response) => {
        try {
          const profile = await this.authService.getUserProfile();
          let username = '';
          if(profile?.exists()){
            const user = profile.data();
            username = user['username'];
          }
          const stripe = await this.stripePromise;
          const result = await stripe?.confirmCardPayment(response.clientSecret, {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                name: username,
              },
            },
          });
          if (result?.error) {
            // If there’s an error, display it
            this.paymentError = result?.error?.message || '';
          } else {
            // Payment was successful
            this.toastr.success('Payment Successful!', 'Success');
            this.router.navigateByUrl("/dashboard");
          }
        } catch (error) {
          // Handle errors
          this.paymentError = 'An error occurred while processing your payment.';
        } finally {
          this.loading = false;
        }
      }, (error: any) => {
        this.loading = false;
      });
  }
}
