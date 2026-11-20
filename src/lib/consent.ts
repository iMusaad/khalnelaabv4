const KEY = "kn_consent";

export const CONSENT_EVENT = "kn-consent";

export type Consent = "granted" | "denied";

export function getConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);

    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {}

  window.dispatchEvent(new Event(CONSENT_EVENT));
}
