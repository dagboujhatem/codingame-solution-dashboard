import { NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonComponent } from '../common/common.component';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { StateService } from '../../../services/state.service';
import { HeaderComponent } from '../../front/components/header/header.component';
import { FooterComponent } from '../../front/components/footer/footer.component';
import { passwordMatchValidator } from '../../pages/common/validations/password-match.validator';

@Component({
  selector: 'app-reset-password',
  imports: [NgIf, RouterLink, ReactiveFormsModule, CommonComponent, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, HeaderComponent, FooterComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  oobCode!: string;
  appName: Signal<string>;

  constructor(private authService: AuthService,
  private stateService: StateService,
  private toastr: ToastrService,
  private router: Router,
  private route: ActivatedRoute,
  ) {
    this.appName = this.stateService?.appName;
  }

 ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validators: passwordMatchValidator.bind(this) });
    this.oobCode = this.route.snapshot.queryParams['oobCode'];
  }

  onResetPassword() {
    if (this.resetPasswordForm.valid) {
      const { newPassword } = this.resetPasswordForm.value;
      this.authService.resetPassword(this.oobCode, newPassword).subscribe({
        next: () => {
          this.toastr.success('Password reset successfully!', 'Success');
          this.router.navigate(['/sign-in']);
        },
        error: (err) => this.toastr.error('Failed to reset password.', 'Error'),
      });
    }
  }
}
