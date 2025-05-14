import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReleaseNote {
  id?: string; // Version will be the ID
  version: string;
  force_update: boolean;
  features: string[];
  bug_fixes: string[];
  release_date: Date | string; // Allow string for input, Date for display/storage
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReleaseNotesService {
  private apiUrl = `${environment.codingameSolutionsFunctionUrl}/release-notes`;

  constructor(private http: HttpClient) { }

  createReleaseNote(releaseNote: Partial<ReleaseNote>): Observable<any> {
    return this.http.post<any>(this.apiUrl, releaseNote);
  }

  getReleaseNotes(): Observable<ReleaseNote[]> {
    return this.http.get<ReleaseNote[]>(this.apiUrl);
  }

  getReleaseNote(version: string): Observable<ReleaseNote> {
    return this.http.get<ReleaseNote>(`${this.apiUrl}/${version}`);
  }

  updateReleaseNote(version: string, releaseNote: Partial<ReleaseNote>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${version}`, releaseNote);
  }

  deleteReleaseNote(version: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${version}`);
  }
} 