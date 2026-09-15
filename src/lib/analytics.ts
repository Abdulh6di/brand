"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fire-and-forget analytics event. No-ops safely when GA/GTM/Meta Pixel
 * aren't loaded (see AnalyticsScripts) — every call site can call this
 * unconditionally.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event: name, ...params });
  window.fbq?.("trackCustom", name, params);
}
