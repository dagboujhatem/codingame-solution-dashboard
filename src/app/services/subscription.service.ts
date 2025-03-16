import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  
  private subscriptionsCollection;

  constructor(private firestore: Firestore) {
    // Initialize Firestore collection reference
    this.subscriptionsCollection = collection(this.firestore, 'subscriptions');
  }

  // Récupérer les abonnements depuis Firestore
  async getSubscriptionsFromFirestore(): Promise<any[]> {
    const querySnapshot = await getDocs(this.subscriptionsCollection);
    const subscriptionsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return subscriptionsList;
  }

  // Ajouter un abonnement à Firestore
  async addSubscription(subscription: any): Promise<void> {
    try {
      const docRef = await addDoc(this.subscriptionsCollection, subscription);
      console.log("Abonnement ajouté avec ID: ", docRef.id);
    } catch (e) {
      console.error("Erreur d'ajout de l'abonnement: ", e);
    }
  }

  // Mettre à jour un abonnement dans Firestore
  async updateSubscription(subscriptionId: string, updatedData: any): Promise<void> {
    try {
      const subscriptionDocRef = doc(this.firestore, 'subscriptions', subscriptionId);
      await updateDoc(subscriptionDocRef, updatedData);
      console.log("Abonnement mis à jour avec succès!");
    } catch (e) {
      console.error("Erreur de mise à jour de l'abonnement: ", e);
    }
  }

  // Supprimer un abonnement de Firestore
  async deleteSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscriptionDocRef = doc(this.firestore, 'subscriptions', subscriptionId);
      await deleteDoc(subscriptionDocRef);
      console.log("Abonnement supprimé avec succès!");
    } catch (e) {
      console.error("Erreur de suppression de l'abonnement: ", e);
    }
  }
}
