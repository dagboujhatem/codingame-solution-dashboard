import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  userForm!: FormGroup;
  user: any;

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private router: Router) { }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
    const profile = this.authService.getUserProfile();
    if(profile){
      this.user = profile;
      this.userForm.patchValue({
        username: profile.photoURL,
        email: profile.email,
      });
    }
  }

  updateUserProfile(): void {
    if (this.userForm.valid) {
      const updatedUser = this.userForm.value;
      const uid = this.user.uid;
      this.authService.updateUserProfile(uid, updatedUser).subscribe((response) => {
        this.toastr.success('Profile updated successfully!', 'Success');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.toastr.error('There was an error updating your profile.', 'Error');
      });
    }
  }
}
