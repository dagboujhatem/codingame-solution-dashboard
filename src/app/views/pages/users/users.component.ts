import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.interface';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  userForm: FormGroup;
  users$!: Observable<User[]>;
  currentUserUId: string | null = null;

  constructor(private userService: UserService,
    private sweetAlert: SweetAlertService,
    private toastr: ToastrService) {
    this.userForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      // password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('User', Validators.required),
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
            this.fetchUsers();
            this.clearForm();
          });
      } else {
        this.userService.addUser(userData).then(() => {
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
