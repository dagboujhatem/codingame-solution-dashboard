import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormArray, FormBuilder } from '@angular/forms';
import { SubscriptionService } from '../../../services/subscription.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { Subscription } from '../../../models/subscription.interface';
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { cilSave, cilActionUndo, cilTrash, cilPen } from '@coreui/icons';
import { DatatableComponent } from '../common/components/datatable/datatable.component';
import { SwitchToggleComponent } from '../common/components/switch-toggle/switch-toggle.component';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, ReactiveFormsModule, IconDirective, DatatableComponent, SwitchToggleComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  icons = { cilSave, cilActionUndo, cilTrash, cilPen };
  subscriptionForm: FormGroup;
  subscriptions: Subscription[] = [];
  currentSubscriptionUId: string | null = null;
  columns: any[] = [
    {
      name: 'Name',
      prop: 'name',
      sortable: true
    },
    {
      name: 'Credits/Tokens',    
      prop: 'credits',
      sortable: true
    },
    {
      name: 'Price',    
      prop: 'price',
      sortable: true
    },
    {
      name: 'Promo Price',    
      prop: 'promoPrice',
      sortable: true
    },

  ];

  constructor(private subscriptionService: SubscriptionService,
    private sweetAlert: SweetAlertService,
    private toastr: ToastrService,
    private fb: FormBuilder) {
    this.subscriptionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      credits: new FormControl(0),
      price: new FormControl(0, [Validators.required, Validators.min(0)]),
      promoPrice: new FormControl(null),
      unlimited: new FormControl(false),
      features: this.fb.array([])
    });
    this.subscriptionForm.get('unlimited')?.valueChanges.subscribe((isUnlimited) => {
      if (isUnlimited) {
        this.subscriptionForm.get('credits')?.setValue(0);
        this.subscriptionForm.get('credits')?.disable();
      } else {
        this.subscriptionForm.get('credits')?.setValue(0);
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
      const subscriptionData: Subscription = {
        ...this.subscriptionForm.value,
        features: this.features.value
      };
      
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
    this.subscriptionForm.patchValue({
      name: subscription.name,
      credits: subscription.credits,
      price: subscription.price,
      promoPrice: subscription.promoPrice,
      unlimited: subscription.unlimited
    });

    while (this.features.length) {
      this.features.removeAt(0);
    }

    if (subscription.features) {
      subscription.features.forEach(feature => {
        this.features.push(this.fb.group({
          key: [feature.key, Validators.required],
          value: [feature.value, Validators.required]
        }));
      });
    }
  }

  onDeleted(subscription: Subscription): void {
    this.sweetAlert.deleteConfirmation().then((result:any) => {
      if (result.isConfirmed) {
        this.subscriptionService.delete(subscription.uid!).then(() => {
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
    while (this.features.length) {
      this.features.removeAt(0);
    }
  }

  getSwitchControl(): FormControl {
    return this.subscriptionForm.get('unlimited') as FormControl;
  }

  get features() {
    return this.subscriptionForm.get('features') as FormArray;
  }

  createFeatureFormGroup() {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  addFeature() {
    this.features.push(this.createFeatureFormGroup());
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }
}
