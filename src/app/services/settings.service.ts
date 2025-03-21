import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Setting } from '../models/setting.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private firestore: Firestore) { }

  addSetting(setting: Setting) {
    const settingsRef = collection(this.firestore, 'settings');
    return addDoc(settingsRef, setting);
  }

  getSettings(): Observable<Setting[]> {
    const settingsRef = collection(this.firestore, 'settings');
    return collectionData(settingsRef, { idField: 'uid' }) as Observable<Setting[]>;
  }

  updateSetting(uid: string, updatedData: Partial<Setting>) {
    const settingDocRef = doc(this.firestore, 'settings', uid);
    return updateDoc(settingDocRef, updatedData);
  }

  deleteSetting(uid: string) {
    const settingDocRef = doc(this.firestore, 'settings', uid);
    return deleteDoc(settingDocRef);
  }
}
