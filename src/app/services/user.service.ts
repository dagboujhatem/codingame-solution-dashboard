import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.codingameSolutionsFunctionUrl;
  constructor(private http: HttpClient) { }

  addUser(payload: User) {
    return this.http.post(`${this.apiUrl}/add-user`, payload);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/get-users`);
  }

  getUser(uid: string) {
    return this.http.get(`${this.apiUrl}/get-user/${uid}`);
  }

  updateUser(uid: string, user: Partial<User>) {
    return this.http.put(`${this.apiUrl}/update-user/${uid}`, user);
  }

  deleteUser(uid: string) {
    return this.http.delete(`${this.apiUrl}/delete-user/${uid}`, {} );
  }
}
