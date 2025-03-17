import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubscriptionService } from '../../../services/subscription.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { Subscription } from '../../../services/subscription.service';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  subscriptionForm: FormGroup;
  subscriptions: Subscription[] = [];
  currentSubscriptionId: string | null = null;

  constructor(private subscriptionService: SubscriptionService) {
    this.subscriptionForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      credits: new FormControl(0),
      unlimited: new FormControl(false),
      price: new FormControl(0, Validators.required),
    });
  }

  ngOnInit(): void {
    this.fetchSubscriptions();
  }

  fetchSubscriptions(): void {
    this.subscriptionService.getAll().subscribe((data) => {
      this.subscriptions = data;
    });
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid) {
      const subscriptionData: Subscription = this.subscriptionForm.value;
      if (this.currentSubscriptionId) {
        this.subscriptionService
          .update(this.currentSubscriptionId, subscriptionData)
          .then(() => {
            this.fetchSubscriptions();
            this.clearForm();
          });
      } else {
        this.subscriptionService.create(subscriptionData).then(() => {
          this.fetchSubscriptions();
          this.clearForm();
        });
      }
    }
  }

  onEdit(subscription: Subscription): void {
    this.currentSubscriptionId = subscription.id;
    this.subscriptionForm.patchValue(subscription);
  }

  onDelete(id: string): void {
    this.subscriptionService.delete(id).then(() => {
      this.fetchSubscriptions();
    });
  }

  clearForm(): void {
    this.subscriptionForm.reset();
    this.currentSubscriptionId = null;
  }
}
