/*!
 * CookieConsent by Brendigo — Shopify Customer Privacy API bridge.
 * Calls Shopify's consent API only after a visitor makes a choice.
 */
(function (root) {
  'use strict';
  var pending = null, privacy = null, loading = false, lastSubmitted = '';
  function submit(choice) {
    if (!privacy || !choice) return;
    var signature = JSON.stringify(choice);
    if (signature === lastSubmitted) return;
    lastSubmitted = signature;
    privacy.setTrackingConsent({
      analytics: choice.analytics === true,
      marketing: choice.marketing === true && !(root.navigator && root.navigator.globalPrivacyControl),
      preferences: choice.preferences === true
    }, function (error) {
      if (error) {
        if (lastSubmitted === signature) lastSubmitted = '';
        pending = choice;
        if (root.console) root.console.warn('[Brendigo] Shopify consent update failed.');
      }
    });
  }
  root.BrendigoShopifyPrivacyBridge = {
    apply: function (choice) {
      // A null choice is an explicit withdrawal/reset: deny optional tracking.
      var data = {analytics:!!(choice && choice.analytics === true),
        marketing:!!(choice && choice.marketing === true),
        preferences:!!(choice && choice.preferences === true)};
      if (privacy) submit(data);
      else pending = data; // Keep the latest choice only; never buffer unbounded decisions.
    }
  };
  // The storefront may not expose the API (editor, headless, restricted theme).
  // Do not guess cookie formats or write Shopify-owned privacy cookies directly.
  function connect() {
    if (privacy || loading || !root.Shopify ||
        typeof root.Shopify.loadFeatures !== 'function') return;
    loading = true;
    root.Shopify.loadFeatures(
      [{name:'consent-tracking-api',version:'0.2'}],
      function (error) {
        loading = false;
        if (error || !root.Shopify.customerPrivacy) {
          if (root.console && typeof root.console.warn === 'function') {
            root.console.warn('[Brendigo] Shopify Customer Privacy API is unavailable.');
          }
          return;
        }
        privacy = root.Shopify.customerPrivacy;
        if (pending) {
          var last = pending;
          pending = null;
          submit(last);
        }
      }
    );
  }
  connect();
  // Some storefront themes expose Shopify after third-party app scripts run.
  // Retry once at page load; never write consent without a visitor's decision.
  if (root.addEventListener) root.addEventListener('load', connect, {once:true});
})(window);
