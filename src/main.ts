/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { environment } from './environments/environment';
import { initializeApp } from 'firebase/app';

if (environment.useEmulators) {
  initializeApp(environment.firebaseConfig);
  const auth = getAuth();
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

  const firestore = getFirestore();
  connectFirestoreEmulator(firestore, 'localhost', 8080);

  const storage = getStorage();
  connectStorageEmulator(storage, 'localhost', 9199);
}
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

