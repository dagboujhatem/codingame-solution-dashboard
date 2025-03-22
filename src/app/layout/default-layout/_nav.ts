import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  },
  {
    title: true,
    name: 'Menu'
  },
  {
    name: 'My Profile',
    url: '/profile',
    iconComponent: { name: 'cil-user' }
  },
  {
    name: 'Users',
    url: '/users',
    iconComponent: { name: 'cil-people' }
  },
  {
    name: 'Settings',
    url: '/settings',
    iconComponent: { name: 'cil-settings' }
  },
  {
    name: 'Subscriptions',
    url: '/subscriptions',
    iconComponent: { name: 'cil-applications-settings' }
  }
];
