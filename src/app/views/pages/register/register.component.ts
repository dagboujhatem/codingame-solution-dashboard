import { Component, OnInit } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [NgIf, ReactiveFormsModule, ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective]
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  constructor(private authService: AuthService,
      private toastr: ToastrService,
      private router: Router) { }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      passwordConfirmation: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    },); // Add custom validator for password confirmation // this.passwordMatchValidator
  }

  // Custom validator to check if password and passwordConfirmation match
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordConfirmation')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      const { username, email, password } = this.signupForm.value;
      this.authService.register(username, email, password).subscribe(
        (response:any) => {
          // Handle successful signup
          this.toastr.success('You\'re registered successfully', 'Welcome');
          this.router.navigateByUrl('/dashboard')
        },
        (error:any) => {
          // Handle error
          if (error.code === 'auth/email-already-in-use') {
            this.toastr.error('This email is already registered.', 'Registration Failed');
          } else {
            this.toastr.error('An error occurred. Please try again later.', 'Error');
          }
          console.error('Error signing in: ', error.message);
        }
      );
    }
  }
}
