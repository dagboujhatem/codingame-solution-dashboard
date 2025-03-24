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
import { IconDirective } from '@coreui/icons-angular';
import { cibGooglePay } from '@coreui/icons';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, HeaderComponent, FooterComponent, IconDirective],
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
  icons = { cibGooglePay };
  private cardElement: any;
  private googlePayElement: any;
  private paypalElement: any;
  private applePayElement: any;
  public cardValid: boolean = false;
  private username = '';
  private email = '';
  private uid : any;

  constructor(private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private checkoutService: CheckoutService) {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  async ngOnInit() {
    this.subscriptionId = this.route.snapshot.paramMap.get('id')!;
    const profile = await this.authService.getUserProfile();
    if(profile?.exists()){
      const user = profile.data();
      this.username = user['username'];
      this.email = user['email'];
      this.uid = user['uid'];
    }
    this.checkoutService.getSubscription(this.subscriptionId)
      .then((subscriptionDoc: any) => {
        if (!subscriptionDoc.exists()) {
          return;
        }
        const subData: Subscription = subscriptionDoc.data();
        this.subscriptionData = subData;
      });
  }

  async ngAfterViewInit() {
    // const stripe = await this.stripePromise;
    // const elements = stripe?.elements();
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

  async pay(event: Event) {
    event.preventDefault();
    if (!this.cardElement || !this.cardValid) {
      return;
    }

    this.loading = true;
    this.paymentError = null;
    const payload = {
      productId: this.subscriptionData.stripeProductId,
      username: this.username,
      email: this.email
    }
    this.checkoutService.createPaymentIntent(payload)
      .subscribe(async (response) => {
        try {
          const stripe = await this.stripePromise;
          const result = await stripe?.confirmCardPayment(response.clientSecret, {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                name: this.username,
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
            await this.checkoutService.updateUserToken(this.uid, this.subscriptionData.credits, this.subscriptionData.unlimited)
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

  async payWithPayPal(event: Event) {
    event.preventDefault();
    this.loading = true;
    this.paymentError = null;

    const payload = {
      productId: this.subscriptionData.stripeProductId,
      username: this.username,
      email: this.email
    };

    this.checkoutService.createPaymentIntent(payload)
      .subscribe(async (response) => {
        try {
          const stripe = await this.stripePromise;
          const result = await stripe?.confirmPayment({
            elements: this.paypalElement, // Ensure you have a PayPal Stripe element
            confirmParams: {
              return_url: window.location.href, // Redirect after payment
            },
          });

          this.handlePaymentResult(result);
        } catch (error) {
          this.paymentError = 'An error occurred with PayPal.';
        } finally {
          this.loading = false;
        }
      });
  }

  async payWithGooglePay(event: Event) {
    event.preventDefault();
    this.loading = true;
    this.paymentError = null;

    const payload = {
      productId: this.subscriptionData.stripeProductId,
      username: this.username,
      email: this.email
    };

    this.checkoutService.createPaymentIntent(payload)
      .subscribe(async (response) => {
        try {
          const stripe = await this.stripePromise;
          const result = await stripe?.confirmPayment({
            elements: this.googlePayElement, // Ensure you have a Google Pay Stripe element
            confirmParams: {
              return_url: window.location.href,
            },
          });

          this.handlePaymentResult(result);
        } catch (error) {
          this.paymentError = 'An error occurred with Google Pay.';
        } finally {
          this.loading = false;
        }
      });
  }

  async payWithApplePay(event: Event) {
    event.preventDefault();
    this.loading = true;
    this.paymentError = null;

    const payload = {
      productId: this.subscriptionData.stripeProductId,
      username: this.username,
      email: this.email
    };

    this.checkoutService.createPaymentIntent(payload)
      .subscribe(async (response) => {
        try {
          const stripe = await this.stripePromise;
          const result = await stripe?.confirmPayment({
            elements: this.applePayElement, // Ensure you have an Apple Pay Stripe element
            confirmParams: {
              return_url: window.location.href,
            },
          });

          this.handlePaymentResult(result);
        } catch (error) {
          this.paymentError = 'An error occurred with Apple Pay.';
        } finally {
          this.loading = false;
        }
      });
  }

  private async handlePaymentResult(result: any) {
    if (result?.error) {
      this.paymentError = result.error.message;
    } else {
      this.toastr.success('Payment Successful!', 'Success');
      this.router.navigateByUrl("/dashboard");
      await this.checkoutService.updateUserToken(this.uid, this.subscriptionData.credits, this.subscriptionData.unlimited);
    }
  }
}
