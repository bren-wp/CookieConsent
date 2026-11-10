/*!
 * CookieConsent by Brendigo: optional Google Consent Mode v2 Basic adapter.
 * Include SYNCHRONOUSLY in <head> before any Google tag. Tag(s) must remain
 * blocked by the host integration until the correct consent is granted.
 * This file never loads or contacts Google by itself.
 */
(function (root) {
  'use strict';
  if (root.__BCC_GOOGLE_BASIC_READY__) return;
  root.__BCC_GOOGLE_BASIC_READY__ = true;
  root.dataLayer = root.dataLayer || [];
  var previousGtag = root.gtag;
  if (typeof previousGtag !== 'function') {
    root.gtag = function () { root.dataLayer.push(arguments); };
  }
  var gtag = root.gtag;
  function map(consent) {
    var analytics = !!(consent && consent.analytics === true);
    var marketing = !!(consent && consent.marketing === true && root.navigator.globalPrivacyControl !== true);
    var preferences = !!(consent && consent.preferences === true);
    return {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      functionality_storage: preferences ? 'granted' : 'denied',
      personalization_storage: preferences ? 'granted' : 'denied',
      security_storage: 'granted'
    };
  }
  gtag('consent', 'default', map(null));
  function update(event) {
    var detail = event && event.detail;
    gtag('consent', 'update', map(detail && detail.consent));
  }
  root.addEventListener('brendigo:consentready', update);
  root.addEventListener('brendigo:consentchange', update);
})(window);
