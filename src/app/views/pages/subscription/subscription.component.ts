import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubscriptionService } from '../../../services/subscription.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { Subscription } from '../../../models/subscription.interface';
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { cilSave, cilActionUndo, cilTrash, cilPen } from '@coreui/icons';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, ReactiveFormsModule, IconDirective],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  icons = { cilSave, cilActionUndo, cilTrash, cilPen };
  subscriptionForm: FormGroup;
  subscriptions: Subscription[] = [];
  currentSubscriptionUId: string | null = null;

  constructor(private subscriptionService: SubscriptionService,
    private sweetAlert: SweetAlertService,
    private toastr: ToastrService) {
    this.subscriptionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      credits: new FormControl(0),
      price: new FormControl(0, [Validators.required, Validators.min(0)]),
      promoPrice: new FormControl(null),
      unlimited: new FormControl(false),
    });
    this.subscriptionForm.get('unlimited')?.valueChanges.subscribe((isUnlimited) => {
      if (isUnlimited) {
        this.subscriptionForm.get('credits')?.disable();
      } else {
        this.subscriptionForm.get('credits')?.enable();
      }
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
      if (this.currentSubscriptionUId) {
        this.subscriptionService
          .update(this.currentSubscriptionUId, subscriptionData)
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
    this.currentSubscriptionUId = subscription.uid;
    this.subscriptionForm.patchValue(subscription);
  }

  onDelete(uid: string): void {
    this.sweetAlert.deleteConfirmation().then((result:any) => {
      if (result.isConfirmed) {
        this.subscriptionService.delete(uid).then(() => {
          this.fetchSubscriptions();
        });
      }else{
        this.toastr.warning('Deletion cancelled!');
      }
    });
  }

  clearForm(): void {
    this.subscriptionForm.reset();
    this.currentSubscriptionUId = null;
  }
}
