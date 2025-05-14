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
    name: 'Home',
    url: '/home',
    iconComponent: { name: 'cil-home' }
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
  },
  {
    name: 'Release Notes',
    url: '/release-notes',
    iconComponent: { name: 'cil-notes' }
  },
  {
    name: 'Plans',
    url: '/plans',
    iconComponent: { name: 'cil-basket' }
  },
  {
    name: 'Helps',
    url: '/helps',
    iconComponent: { name: 'cil-speech' }
  }
];
