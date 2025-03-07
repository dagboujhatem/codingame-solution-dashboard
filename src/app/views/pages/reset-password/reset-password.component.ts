import { NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonComponent } from '../common/common.component';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  imports: [NgIf, RouterLink, ReactiveFormsModule, CommonComponent, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  oobCode!: string;

  constructor(private authService: AuthService,
  private toastr: ToastrService,
  private router: Router,
  private route: ActivatedRoute,
  ) { }

 ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, this.passwordMatchValidator.bind(this)]),
    });
    this.oobCode = this.route.snapshot.queryParams['oobCode'];
  }

  passwordMatchValidator(control: FormControl): { [key: string]: boolean } | null {
    if (this.resetPasswordForm && this.resetPasswordForm.get('newPassword')?.value !== control.value) {
      return { 'passwordMismatch': true };
    }
    return null;
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
