import { NgcCookieConsentConfig } from "ngx-cookieconsent";
import { environment } from "../environments/environment";

export const cookieConfig : NgcCookieConsentConfig= {
    cookie: {
      domain: environment.domain
    },
    palette: {
      popup: {
        background: '#000'
      },
      button: {
        background: '#f1d600'
      }
    },
    theme: 'classic',
    type: 'opt-in',
    content: {
      message: 'This website uses cookies to ensure you get the best experience on our website.',
      dismiss: 'Got it!',
      deny: 'Decline',
      link: 'Learn more',
      href: `${environment.domain}privacy-policy`,
      policy: 'Cookie Policy'
    }
  }