import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.interface';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { IconDirective } from '@coreui/icons-angular';
import { cilSave, cilActionUndo, cilTrash, cilPen } from '@coreui/icons';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule, IconDirective],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  icons = { cilSave, cilActionUndo, cilTrash, cilPen };
  userForm: FormGroup;
  users$!: Observable<User[]>;
  currentUserUId: string | null = null;

  constructor(private userService: UserService,
    private sweetAlert: SweetAlertService,
    private toastr: ToastrService) {
    this.userForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('User', Validators.required),
      tokens: new FormControl(1, [Validators.required, Validators.min(0)]),
      unlimited: new FormControl(false)
    });
    this.userForm.get('unlimited')?.valueChanges.subscribe(value => {
      const tokensControl = this.userForm.get('tokens');
      if (value) {
        tokensControl?.disable();
      } else {
        tokensControl?.enable();
      }
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
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
          .then(() => {
            this.toastr.success('User updated successfully!');
            this.fetchUsers();
            this.clearForm();
          });
      } else {
        this.userService.addUser(userData).then(() => {
          this.toastr.success('User added successfully!');
          this.fetchUsers();
          this.clearForm();
        });
      }
    }
  }

  onEdit(user: User): void {
    this.currentUserUId = user.uid;
    this.userForm.patchValue(user);
  }

  onDelete(uid: string): void {
    this.sweetAlert.deleteConfirmation().then((result: any) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(uid).then(() => {
          this.toastr.success('User deleted successfully!');
          this.fetchUsers();
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
}
