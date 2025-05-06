import { Injectable, signal, computed } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Setting } from '../models/setting.interface';
import { Subscription } from '../models/subscription.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private settings = signal<Setting[]>([]);
  private subscriptions = signal<Subscription[]>([]);

  constructor(
    private firestore: Firestore,
    private sanitizer: DomSanitizer
  ) {
    this.loadSettings();
    this.loadSubscriptions();
  }

  private loadSettings(): void {
    const settingsRef = collection(this.firestore, 'settings');
    collectionData(settingsRef, { idField: 'uid' }).subscribe(settings => {
      this.settings.set(settings as Setting[]);
    });
  }

  private loadSubscriptions(): void {
    const settingsRef = collection(this.firestore, 'subscriptions');
    collectionData(settingsRef, { idField: 'uid' }).subscribe(subscriptions => {
      this.subscriptions.set(subscriptions as Subscription[]);
    });
  }

  supportMail = computed(() => {
    return this.settings().find(setting => setting.key === 'support-mail')?.value || 'dagboujhatem@gmail.com';
  });

  appName = computed(() => {
    return this.settings().find(setting => setting.key === 'app-name')?.value || 'Codingame Solutions';
  });

  youtubeLink = computed(() => {
    const url = this.settings().find(setting => setting.key === 'youtube-tuto')?.value || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  unlimitedSubscriptions = computed(() => {
    return this.subscriptions().filter(sub => sub.unlimited);
  });

  limitedSubscriptions = computed(() => {
    return this.subscriptions().filter(sub => !sub.unlimited);
  });
}
