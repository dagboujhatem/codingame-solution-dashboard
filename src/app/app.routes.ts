import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';
import { authenticationGuard } from './guards/authentication.guard';
import { authorizationGuard } from './guards/authorization.guard';
import { noAuthGuard } from './guards/no-auth.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./views/front/home/home.component').then(m => m.HomeComponent)
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
        path: 'release-notes',
        loadComponent: () => import('./views/pages/release-notes/release-notes.component').then(m => m.ReleaseNotesComponent),
        data: {
          title: 'Release Notes'
        }
      }
    ]
  },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./views/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register', 
    canActivate: [noAuthGuard],
    loadComponent: () => import('./views/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./views/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./views/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'terms-of-use',
    loadComponent: () => import('./views/front/terms-of-use/terms-of-use.component').then(m => m.TermsOfUseComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./views/front/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
  },
  {
    path: 'helps',
    loadComponent: () => import('./views/front/helps/helps.component').then(m => m.HelpsComponent),
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
  {
    path: '404',
    loadComponent: () => import('./views/error/page404/page404.component').then(m => m.Page404Component),
  },
  {
    path: '500',
    loadComponent: () => import('./views/error/page500/page500.component').then(m => m.Page500Component),
  },
  { path: '**', redirectTo: '404' }
];
