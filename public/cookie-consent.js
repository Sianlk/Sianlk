/**
 * GDPR/CCPA-compliant cookie consent banner.
 * Fires consent events for analytics/marketing systems to honour.
 */
(function () {
  "use strict";

  const CONSENT_KEY = "cookie_consent_v1";
  const CONSENT_DURATION_DAYS = 365;

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch { return null; }
  }

  function saveConsent(prefs) {
    const expires = new Date(Date.now() + CONSENT_DURATION_DAYS * 864e5).toISOString();
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...prefs, expires, version: "1.0" }));
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: prefs }));
    // Send to backend
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/v1/gdpr/consent", JSON.stringify(prefs));
    }
  }

  function removeBanner(banner) {
    banner.style.transform = "translateY(100%)";
    setTimeout(() => banner.remove(), 400);
  }

  function injectBanner() {
    if (getConsent()) return; // Already decided

    const banner = document.createElement("div");
    banner.id = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML = `
      <style>
        #cookie-consent {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
          background: #1a1a2e; color: #e0e0e0; padding: 20px 24px;
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
          transform: translateY(0); transition: transform 0.4s ease;
          font-family: system-ui, -apple-system, sans-serif; font-size: 14px;
        }
        #cookie-consent p { margin: 0; flex: 1; min-width: 240px; line-height: 1.5; }
        #cookie-consent a { color: #6d6dff; }
        #cookie-consent .cc-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        #cookie-consent button {
          padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;
          font-weight: 600; font-size: 14px; transition: opacity 0.2s;
        }
        #cookie-consent button:hover { opacity: 0.85; }
        #cc-accept-all { background: #6d6dff; color: #fff; }
        #cc-reject { background: #2a2a4a; color: #aaa; }
        #cc-customize { background: transparent; color: #6d6dff; text-decoration: underline; border: none; }
      </style>
      <p>We use cookies to improve your experience. By continuing, you agree to our
        <a href="/privacy" target="_blank">Privacy Policy</a> and
        <a href="/terms" target="_blank">Terms of Service</a>.</p>
      <div class="cc-btns">
        <button id="cc-accept-all">Accept All</button>
        <button id="cc-reject">Reject Non-Essential</button>
        <button id="cc-customize">Customize</button>
      </div>`;

    document.body.appendChild(banner);

    document.getElementById("cc-accept-all").onclick = () => {
      saveConsent({ analytics: true, marketing: true, third_party_sharing: true });
      removeBanner(banner);
    };
    document.getElementById("cc-reject").onclick = () => {
      saveConsent({ analytics: false, marketing: false, third_party_sharing: false });
      removeBanner(banner);
    };
    document.getElementById("cc-customize").onclick = () => {
      window.location.href = "/privacy-settings";
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBanner);
  } else {
    injectBanner();
  }
})();
