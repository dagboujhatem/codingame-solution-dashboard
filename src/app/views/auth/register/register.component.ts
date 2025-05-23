import { Component, OnInit, Signal } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { HeaderComponent } from '../../front/components/header/header.component';
import { FooterComponent } from '../../front/components/footer/footer.component';
import { passwordMatchValidator } from '../../pages/common/validations/password-match.validator';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [NgIf, RouterLink, ReactiveFormsModule, ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, HeaderComponent, FooterComponent]
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  appName: Signal<string>;

  constructor(private authService: AuthService,
      private stateService: StateService,
      private toastr: ToastrService,
      private router: Router) {
        this.appName = this.stateService?.appName;
      }

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
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      acceptTerms: new FormControl(false, [Validators.requiredTrue])
    }, { validators: passwordMatchValidator.bind(this) });
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
          const message = error.error.error || '';
          if (message) {
            this.toastr.error(message, 'Registration Failed');
          } else {
            this.toastr.error('An error occurred. Please try again later.', 'Error');
          }
        }
      );
    }
  }
}
