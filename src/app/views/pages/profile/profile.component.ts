import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { passwordMatchValidator } from '../common/validations/password-match.validator';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IconDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: any;

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private router: Router) { }

  async ngOnInit() {
    this.passwordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    }, { validators: passwordMatchValidator.bind(this) });
    this.profileForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
    const profile = await this.authService.getUserProfile()
    if(profile?.exists()){
      this.user = profile.data();;
      this.profileForm.patchValue({
        username: this.user.username,
        email: this.user.email,
      });
    }
  }

  updateUserProfile(): void {
    if (this.profileForm.valid) {
      const updatedUser = this.profileForm.value;
      this.authService.updateUserProfile(updatedUser).subscribe((response:any) => {
        this.toastr.success('Profile updated successfully!', 'Success');
        this.router.navigate(['/dashboard']);
      },
      (error:any) => {
        this.toastr.error('There was an error updating your profile.', 'Error');
      });
    }
  }

  updateUserPassword(): void {
    if (this.passwordForm.valid) {
      const updatedUser = this.passwordForm.value;
      this.authService.updateUserPassword(updatedUser).subscribe((response:any) => {
        this.toastr.success('Password updated successfully!', 'Success');
      }); 
    }
  }
}
