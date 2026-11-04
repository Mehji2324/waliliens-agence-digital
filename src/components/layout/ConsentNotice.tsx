import React, { useEffect, useState } from 'react';
import {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsentChoice,
  OPEN_CONSENT_EVENT,
  setAnalyticsConsentChoice,
} from '../../utils/consent';

interface ConsentNoticeProps {
  enabled: boolean;
}

export const ConsentNotice: React.FC<ConsentNoticeProps> = ({ enabled }) => {
  const [visible, setVisible] = useState(
    enabled && getAnalyticsConsentChoice() === null,
  );

  useEffect(() => {
    if (!enabled) return;

    const onConsentUpdate = () => setVisible(false);
    const onOpenSettings = () => setVisible(true);
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsentUpdate);
    window.addEventListener(OPEN_CONSENT_EVENT, onOpenSettings);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsentUpdate);
      window.removeEventListener(OPEN_CONSENT_EVENT, onOpenSettings);
    };
  }, [enabled]);

  if (!enabled || !visible) return null;

  return (
    <aside
      aria-label="Optional analytics consent"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-white/15 bg-obsidian-900 p-5 shadow-2xl sm:inset-x-6"
      role="region"
      aria-describedby="analytics-consent-description"
    >
      <h2 className="font-display text-lg font-semibold text-white">Optional diagnostics</h2>
      <p id="analytics-consent-description" className="mt-2 text-sm leading-relaxed text-neutral-300">
        If enabled, Sentry performance diagnostics and session replay help us improve the site. They stay off unless you accept. You can change your choice later in Cookie settings.
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => setAnalyticsConsentChoice(false)}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-neutral-200 hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyber-cyan"
        >
          Reject optional
        </button>
        <button
          type="button"
          onClick={() => setAnalyticsConsentChoice(true)}
          className="rounded-lg bg-cyber-cyan px-4 py-2 text-sm font-semibold text-obsidian-950 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          Accept optional
        </button>
      </div>
    </aside>
  );
};
