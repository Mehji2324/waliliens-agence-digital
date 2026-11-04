export const ANALYTICS_CONSENT_EVENT = 'walili:analytics-consent';
export const OPEN_CONSENT_EVENT = 'walili:open-consent';
const CONSENT_STORAGE_KEY = 'walili_analytics_consent';

export const getAnalyticsConsentChoice = (): boolean | null => {
  try {
    const choice = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (choice === 'accepted') return true;
    if (choice === 'rejected') return false;
    return null;
  } catch (error) {
    console.error('Unable to read analytics consent preference:', error);
    return null;
  }
};

export const setAnalyticsConsentChoice = (accepted: boolean): void => {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, accepted ? 'accepted' : 'rejected');
  } catch (error) {
    console.error('Unable to save analytics consent preference:', error);
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: accepted }));
};

export const openConsentSettings = (): void => {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
};
