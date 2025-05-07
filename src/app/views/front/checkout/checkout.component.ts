import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../../services/checkout.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from '../../../models/subscription.interface';
import {
  loadStripe, PaymentRequestOptions, Stripe, StripeElements, StripePaymentRequestButtonElement,
  StripePaymentRequestButtonElementOptions,
} from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { cibGooglePay } from '@coreui/icons';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, HeaderComponent, FooterComponent, IconDirective, BreadcrumbComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  private subscriptionId!: string;
  public subscriptionData!: Subscription;
  private stripePromise: Promise<Stripe | null>;
  private stripe!: Stripe | null;
  private elements!: StripeElements;
  public paymentError: string | null = null;
  public loading = false;
  @ViewChild('cardElement', { static: false }) cardElementRef: ElementRef | undefined;
  @ViewChild('googlePayElementRef') googlePayElementRef!: ElementRef | undefined;
  @ViewChild('applePayElementRef') applePayElementRef!: ElementRef | undefined;
  @ViewChild('paypalElementRef') paypalElementRef!: ElementRef | undefined;
  icons = { cibGooglePay };
  private cardElement: any;
  private googlePayElement: any;
  private paypalElement: any;
  private applePayElement: any;
  public cardValid: boolean = false;
  private username = '';
  private email = '';
  private uid: any;

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
    if (profile?.exists()) {
      const user = profile.data();
      this.username = user['username'];
      this.email = user['email'];
      this.uid = user['uid'];
    }
  }

  async ngAfterViewInit() {
    try {
      this.stripe = await this.stripePromise!;
      if (!this.stripe) {
        console.error('Stripe failed to initialize');
        return;
      }
      this.elements = this.stripe.elements();
      await this.loadSubscriptionData()
      if (this.cardElementRef) {
        this.initializeCardPayment();
      }
      if (this.googlePayElementRef || this.applePayElementRef || this.paypalElementRef) {
        await this.initializePaymentRequestButton();
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  async initializePaymentRequestButton() {
    const paymentRequest = this.createPaymentRequest();
    const paymentRequestButton: StripePaymentRequestButtonElement = this.elements.create(
      'paymentRequestButton',
      { paymentRequest } as StripePaymentRequestButtonElementOptions
    );
    const canMakePayment = await paymentRequest?.canMakePayment()
    if (canMakePayment) {
      this.unmountExistingButtons();
      if (this.googlePayElementRef) {
        paymentRequestButton.mount(this.googlePayElementRef?.nativeElement);
      }
      // if (this.applePayElementRef) {
      //   paymentRequestButton.mount(this.applePayElementRef?.nativeElement);
      // }
      // if (this.paypalElementRef) {
      //   paymentRequestButton.mount(this.paypalElementRef?.nativeElement);
      // }
    } else {
      console.warn('Payment request button is not available on this device.');
    }
  }

  private unmountExistingButtons() {
    if (this.googlePayElementRef?.nativeElement?.children.length) {
      this.googlePayElementRef.nativeElement.innerHTML = '';
    }
    if (this.applePayElementRef?.nativeElement?.children.length) {
      this.applePayElementRef.nativeElement.innerHTML = '';
    }
    if (this.paypalElementRef?.nativeElement?.children.length) {
      this.paypalElementRef.nativeElement.innerHTML = '';
    }
  }

  async loadSubscriptionData() {
    const subscriptionDoc = await this.checkoutService.getSubscription(this.subscriptionId);
    if (!subscriptionDoc.exists()) {
      return;
    }
    const subData: any = subscriptionDoc.data();
    this.subscriptionData = subData;
  }

  private initializeCardPayment() {
    this.cardElement = this.elements.create('card');
    this.cardElement.mount(this.cardElementRef?.nativeElement);
    this.cardElement.on('change', (event: any) => {
      this.cardValid = event.complete;
    });
  }

  private createPaymentRequest() {
    const productPrice = this.subscriptionData?.promoPrice ? this.subscriptionData?.promoPrice : this.subscriptionData?.price;
    const priceInCents = Math.round(productPrice * 100);
    return this.stripe?.paymentRequest({
      country: 'FR',
      currency: 'eur',
      total: {
        label: `Payment for ${this.subscriptionData?.name}`,
        amount: priceInCents,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      // paymentMethodTypes: ['card', 'paypal'],
      // supportedPaymentMethods: ['googlePay', 'applePay', 'card'],
    } as PaymentRequestOptions);
  }

  async payWithCard(event: Event) {
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
          // const stripe = await this.stripePromise;
          const result = await this.stripe?.confirmPayment({
            elements: this.paypalElement,
            confirmParams: {
              return_url: window.location.href,
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
            elements: this.googlePayElement,
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
            elements: this.applePayElement,
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
    console.log(result)
    if (result?.error) {
      this.paymentError = result.error.message;
    } else {
      this.toastr.success('Payment Successful!', 'Success');
      this.router.navigateByUrl("/dashboard");
      await this.checkoutService.updateUserToken(this.uid, this.subscriptionData.credits, this.subscriptionData.unlimited);
    }
  }
}
