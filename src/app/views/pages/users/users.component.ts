import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.interface';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { IconDirective } from '@coreui/icons-angular';
import { cilSave, cilActionUndo, cilTrash, cilPen } from '@coreui/icons';
import { DatatableComponent } from '../common/components/datatable/datatable.component';
import { SwitchToggleComponent } from '../common/components/switch-toggle/switch-toggle.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule, IconDirective, DatatableComponent, SwitchToggleComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  icons = { cilSave, cilActionUndo, cilTrash, cilPen };
  userForm: FormGroup;
  users$!: Observable<User[]>;
  currentUserUId: string | null = null;
  @ViewChild('roleTemplate', { static: true }) roleTemplate!: TemplateRef<any>;
  @ViewChild('tokensTemplate', { static: true }) tokensTemplate!: TemplateRef<any>;
  columns: any[] = []

  constructor(private userService: UserService,
    private sweetAlert: SweetAlertService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router) {
    this.userForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', []),
      role: new FormControl('User', Validators.required),
      tokens: new FormControl(1, [Validators.required, Validators.min(0)]),
      unlimited: new FormControl(false)
    });
    this.userForm.get('unlimited')?.valueChanges.subscribe(isUnlimited => {
      const tokensControl = this.userForm.get('tokens');
      if (isUnlimited) {
        tokensControl?.disable();
        this.userForm.get('tokens')?.setValue(0);
      } else {
        tokensControl?.enable();
        this.userForm.get('tokens')?.setValue(0);
      }
    });
    this.userForm.get('password')?.valueChanges.subscribe(value => {
      const passwordControl = this.userForm.get('password');
      if (!passwordControl) return;

      // Check current validators to avoid reapplying unnecessarily
      const currentValidators = passwordControl.validator ? [passwordControl.validator] : [];

      if (value && currentValidators.length === 0) {
        passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
        passwordControl.updateValueAndValidity({ emitEvent: false }); // avoid triggering again
      } else if (!value && currentValidators.length > 0) {
        passwordControl.clearValidators();
        passwordControl.updateValueAndValidity({ emitEvent: false }); // avoid triggering again
      }
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
    this.columns = [
      {
        name: 'Name',
        prop: 'username',
        sortable: true
      },
      {
        name: 'Email',
        prop: 'email',
        sortable: true
      },
      {
        name: 'Role',
        prop: 'role',
        sortable: true,
        template: this.roleTemplate
      },
      {
        name: 'Tokens',
        prop: 'tokens',
        sortable: true,
        template: this.tokensTemplate
      },
    ];
  }

  fetchUsers() {
    this.users$ = this.userService.getUsers();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData: User = this.userForm.value;
      if (this.currentUserUId) {
        this.userService
          .updateUser(this.currentUserUId, userData)
          .subscribe((response: any) => {
            this.toastr.success('User updated successfully!');
            this.fetchUsers();
            this.clearForm();
            if(response.mustLoginAgain){
              this.toastr.success('You need to login again to use the new email.', 'Success');
              this.authService.logout();
              this.router.navigate(['/login']);
            }
          }, (error: any) => {
            const message = error.error.error || '';
            this.toastr.error(message, 'Error updating user!');
          });
      } else {
        this.userService.addUser(userData)
          .subscribe((response: any) => {
            this.toastr.success('User added successfully!');
            this.fetchUsers();
            this.clearForm();
          }, (error: any) => {
            const message = error.error.error || '';
            this.toastr.error(message, 'Error adding user!');
          });
      }
    }
  }

  onEdit(user: User): void {
    this.currentUserUId = user.uid;
    this.userService.getUser(user.uid).subscribe((user: any) => {
      this.userForm.patchValue(user);
    });
  }

  onDelete(user: User): void {
    this.sweetAlert.deleteConfirmation().then((result: any) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.uid)
          .subscribe(() => {  
            this.toastr.success('User deleted successfully!');
            this.fetchUsers();
          }, (error: any) => {
            const message = error.error.message || '';
            this.toastr.error(message, 'Error deleting user!');
          });
      } else {
        this.toastr.warning('Deletion cancelled!');
      }
    });
  }

  clearForm(): void {
    this.userForm.reset();
    this.currentUserUId = null;
  }
  
  getSwitchControl(): FormControl {
    return this.userForm.get('unlimited') as FormControl;
  }
}
