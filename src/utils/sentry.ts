import * as Sentry from '@sentry/react';
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsentChoice } from './consent';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  let initialized = false;
  const initialize = () => {
    if (initialized) return;
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    initialized = true;
  };

  const onConsentChange = (event: Event) => {
    const accepted = (event as CustomEvent<boolean>).detail;
    if (accepted) {
      initialize();
    } else if (initialized) {
      void Sentry.close(2000).catch((error) => {
        console.error('Unable to stop optional diagnostics after consent withdrawal:', error);
      });
      initialized = false;
    }
  };

  window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsentChange);
  if (getAnalyticsConsentChoice() === true) initialize();
}
