import { Component, OnInit, Signal } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { CommonComponent } from '../common/common.component';
import { StateService } from '../../../services/state.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [NgIf, RouterLink, ReactiveFormsModule, CommonComponent, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle]
})
export class LoginComponent implements OnInit {
  signInForm!: FormGroup;
  appName: Signal<string>;

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private stateService: StateService,
    private router: Router,
  ) {
    this.appName = this.stateService?.appName;
  }

  ngOnInit(): void {
    this.signInForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  onSignIn() {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      this.authService.login(email, password).subscribe(
        (response:any) => {
          // Handle successful signup
          this.toastr.success('You\'re logged in successfully', 'Welcome');
          this.router.navigate(['/dashboard']);
        },
        (error:any) => {
          // Handle error
          if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            this.toastr.error('Invalid email or password. Please try again.', 'Sign In Failed');
          } else {
            this.toastr.error('An error occurred. Please try again later.', 'Error');
          }
          console.error('Error signing in: ', error.message);
        }
      );
    }
  }
}
