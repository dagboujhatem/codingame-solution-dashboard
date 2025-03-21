import { Injectable, signal, computed } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Setting } from '../models/setting.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private settings = signal<Setting[]>([]);

  constructor(private firestore: Firestore) {
    this.loadSettings();
  }

  private loadSettings(): void {
    const settingsRef = collection(this.firestore, 'settings');
    collectionData(settingsRef, { idField: 'uid' }).subscribe(settings => {
      this.settings.set(settings as Setting[]);
    });
  }

  private getSettings() {
    return this.settings;
  }

  supportMail = computed(() => {
    return this.settings().find(setting => setting.key === 'support-mail')?.value || 'dagboujhatem@gmail.com';
  });

  appName = computed(() => {
    return this.settings().find(setting => setting.key === 'app-name')?.value || 'Codingame Solutions';
  });

}
