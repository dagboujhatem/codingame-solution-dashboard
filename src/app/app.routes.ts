import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { authenticationGuard } from './guards/authentication.guard';
import { authorizationGuard } from './guards/authorization.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [authenticationGuard],
    canActivateChild: [authorizationGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'users',
        loadComponent: () => import('./views/pages/users/users.component').then((c) => c.UsersComponent),
        data: {
          title: 'Users'
        }
      },
      {
        path: 'profile',
        loadComponent: () => import('./views/pages/profile/profile.component').then((c) => c.ProfileComponent),
        data: {
          title: 'My Profile'
        }
      },
      {
        path: 'settings',
        loadComponent: () => import('./views/pages/setting/setting.component').then((c) => c.SettingComponent),
        data: {
          title: 'Settings'
        }
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./views/pages/subscription/subscription.component').then((c) => c.SubscriptionComponent),
        data: {
          title: 'Subscriptions'
        }
      },
      {
        path: 'theme',
        loadChildren: () => import('./views/theme/routes').then((m) => m.routes)
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./views/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./views/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./views/front/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
  },
  {
    path: 'plans',
    loadComponent: () => import('./views/front/pricing-plans/pricing-plans.component').then(m => m.PricingPlansComponent),
  },
  {
    path: 'checkout/:id',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./views/front/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  { path: '**', redirectTo: '404' }
];
