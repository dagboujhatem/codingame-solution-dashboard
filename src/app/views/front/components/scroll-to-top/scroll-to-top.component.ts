import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '@coreui/icons-angular';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, IconModule],
  template: `
    <button class="scroll-to-top" (click)="scrollToTop()" [class.show]="showScrollButton">
      <i class="cil-arrow-top"></i>
    </button>
  `,
  styles: [`
    .scroll-to-top {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

      &:hover {
        background: black;
        transform: translateY(-3px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }

      &.show {
        opacity: 1;
        visibility: visible;
      }

      i {
        font-size: 1.2rem;
      }
    }

    :host-context(.dark-theme) {
      .scroll-to-top {
        background: var(--cui-dark);
        color: var(--cui-white);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);

        &:hover {
          background: var(--cui-primary);
        }
      }
    }
  `]
})
export class ScrollToTopComponent {
  showScrollButton = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollButton = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
} 