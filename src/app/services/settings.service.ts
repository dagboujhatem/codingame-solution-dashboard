import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, setDoc, updateDoc, deleteDoc, collectionData, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private firestore: Firestore) { }

  addSetting(setting: any) {
    const settingsRef = collection(this.firestore, 'settings');
    return addDoc(settingsRef, setting);
  }


  getSettings(): Observable<any[]> {
    const settingsRef = collection(this.firestore, 'settings');
    return collectionData(settingsRef, { idField: 'id' });
  }

  getSettingById(settingId: string): Observable<any> {
    const settingDocRef = doc(this.firestore, 'settings', settingId);
    return docData(settingDocRef, { idField: 'id' });
  }

  updateSetting(settingId: string, updatedData: any) {
    const settingDocRef = doc(this.firestore, 'settings', settingId);
    return updateDoc(settingDocRef, updatedData);
  }

  deleteSetting(settingId: string) {
    const settingDocRef = doc(this.firestore, 'settings', settingId);
    return deleteDoc(settingDocRef);
  }
}
