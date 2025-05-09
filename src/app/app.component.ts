import { Component, DestroyRef, inject, OnInit, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { delay, filter, map, tap } from 'rxjs/operators';

import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { StateService } from './services/state.service';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    template: `
      <router-outlet></router-outlet>
    `
})
export class AppComponent implements OnInit {
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #titleService = inject(Title);

  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);

  constructor(
    private stateService: StateService, 
    private ccService: NgcCookieConsentService
  ) {
    effect(() => {
      const appName = this.stateService?.appName();
      this.#titleService.setTitle(appName);
    });
    // iconSet singleton
    this.#iconSetService.icons = { ...iconSubset };
    this.#colorModeService.localStorageItemName.set('theme');
    this.#colorModeService.eventName.set('ColorSchemeChange');
  }

  ngOnInit(): void {
    // Vérifier si les cookies sont déjà acceptés
    const cookiesConsent = localStorage.getItem('cookies-consent');
    if (!this.ccService.hasConsented() && cookiesConsent !== 'allow') {
      // Si les cookies ne sont pas acceptés, le popup s'affichera automatiquement
      //console.log('Cookies not accepted, showing consent popup');
    }else{
      this.ccService.destroy();
    }

    // S'abonner aux changements de statut du consentement aux cookies
    this.ccService.statusChange$.pipe(
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe(event => {
      if (event.status === 'allow' || event.status === 'deny') {
        // Cacher le popup après que l'utilisateur ait fait son choix
        this.ccService.destroy();
        localStorage.setItem('cookies-consent', event.status);
      }
    });

    this.#router.events.pipe(
        takeUntilDestroyed(this.#destroyRef)
      ).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });

    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter(theme => ['dark', 'light', 'auto'].includes(theme)),
        tap(theme => {
          this.#colorModeService.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
