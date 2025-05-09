import { NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { CommonComponent } from '../common/common.component';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { StateService } from '../../../services/state.service';
import { HeaderComponent } from '../../front/components/header/header.component';
import { FooterComponent } from '../../front/components/footer/footer.component';

@Component({
  selector: 'app-forgot-password',
  imports: [NgIf, RouterLink, ReactiveFormsModule, CommonComponent, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, HeaderComponent, FooterComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  appName: Signal<string>;

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private stateService: StateService,
  ) {
    this.appName = this.stateService?.appName;
  }

  ngOnInit(): void {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  onForgotPassword() {
    if (this.forgotPasswordForm.valid) {
      const { email } = this.forgotPasswordForm.value;
      this.authService.forgotPassword(email).subscribe({
        next: () => this.toastr.success('Password reset email sent successfully!', 'Success'),
        error: (err) => this.toastr.error('Failed to send password reset email.', 'Error'),
      });
    }
  }

}
