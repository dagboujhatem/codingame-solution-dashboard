import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ColorModeService,
  DropdownComponent,
  // DropdownDividerDirective, 
  // DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
 } from '@coreui/angular';
 import { IconDirective } from '@coreui/icons-angular';

type ThemeMode = 'auto' | 'dark' | 'light';

interface ColorMode {
  name: ThemeMode;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [CommonModule, 
    IconDirective,
    DropdownComponent, 
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    // DropdownHeaderDirective,
    // DropdownDividerDirective
  ],
  templateUrl: './theme-switch.component.html',
  styleUrls: ['./theme-switch.component.scss']
})
export class ThemeSwitchComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  currentTheme = signal<ThemeMode>('auto');
  isDarkMode = false;

  colorModes: ColorMode[] = [
    { name: 'light', text: 'Light', icon: 'cil-sun' },
    { name: 'dark', text: 'Dark', icon: 'cil-moon' },
    { name: 'auto', text: 'Auto', icon: 'cil-contrast' }
  ];

  icons = signal('cil-contrast');
  constructor() {
    //this.#colorModeService.localStorageItemName.set('theme');
    //this.#colorModeService.eventName.set('ColorSchemeChange');
  }

  ngOnInit() {
    // Récupérer le thème sauvegardé
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    } else {
      // Si aucun thème n'est sauvegardé, utiliser le mode auto
      this.applyTheme('auto');
    }
  }

  changeTheme(theme: ThemeMode) {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.#colorModeService.eventName.set('ColorSchemeChange');
    this.#colorModeService.colorMode.set(theme);
    this.applyTheme(theme);
    this.updateIcon();
  }

  private updateIcon() {
    const theme = this.currentTheme();
    const mode = this.colorModes.find(m => m.name === theme);
    if (mode) {
      this.icons.set(mode.icon);
    }
  }

  private applyTheme(theme: ThemeMode) {
    if (theme === 'auto') {
      // Vérifier la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      this.isDarkMode = prefersDark;
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      this.isDarkMode = theme === 'dark';
    }
    this.updateIcon();
  }
} 