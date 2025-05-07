import { computed, Injectable, Signal, signal} from '@angular/core';
import { INavData } from '@coreui/angular';
import { AuthService } from './auth.service';
import { navItems } from '../layout/default-layout/_nav';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  private navItems = signal<INavData[]>([... navItems]);
  private userRoleSignal = signal<string>('');

  constructor(private authService: AuthService) {}

  async updateUserRole(): Promise<void> {
    const role = await this.authService.getAuthUserRole();
    this.userRoleSignal.set(role);
  }

  getUserRoleSignal(): Signal<string> {
    return this.userRoleSignal;
  }

  getNavItemsSignal(): Signal<INavData[]> {
    return computed(() => {
      const role = this.userRoleSignal();
      const navItems = this.navItems();
      if(role === 'Admin'){
        return navItems
      }else if( role === 'User'){
        return navItems.filter(item => item.title || item.url === '/profile' || item.url === '/home' || item.url === '/helps' || item.url === '/plans');
      }else{
        return []
      }
    });
  }
}
