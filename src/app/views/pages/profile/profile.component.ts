import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { passwordMatchValidator } from '../common/validations/password-match.validator';
import { UploadAvatarService } from '../../../services/upload-avatar.service';
@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IconDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: any;

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private uploadService: UploadAvatarService) { }

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
      if(this.selectedFile){
        this.saveAvatar();
      }
      const updatedUser = this.profileForm.value;
      this.authService.updateUserProfile(updatedUser).subscribe((response:any) => {
        this.toastr.success('Profile updated successfully!', 'Success');
        if(response.isEmailChanged){
          this.toastr.success('You need to login again to use the new email.', 'Success');
          this.authService.logout();
          this.router.navigate(['/login']);
        }else{  
          this.router.navigate(['/dashboard']);
        }
      },
      (error:any) => {
        const message = error.error.error || '';
        this.toastr.error(message, 'Error updating infos!');
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string | ArrayBuffer | null;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async saveAvatar() {  
    if (!this.selectedFile) return;
    try {
      await this.uploadService.uploadAvatar(this.selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }

  updateUserPassword(): void {
    if (this.passwordForm.valid) {
      const updatedUser = this.passwordForm.value;
      this.authService.updateUserPassword(updatedUser).subscribe((response:any) => {
        this.passwordForm.reset();
        this.toastr.success('Password updated successfully!', 'Success');
        this.toastr.success('You need to login again to use the new password.', 'Success');
        this.authService.logout();
        this.router.navigate(['/login']);
      }, (error:any) => {
        console.error('Error updating password:', error);
        const message = error.error.message || '';
        this.toastr.error(message, 'Error');
      }); 
    }
  }
}
