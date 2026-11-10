/*!
 * CookieConsent by Brendigo — Shopify Customer Privacy API bridge.
 * Calls Shopify's consent API only after a visitor makes a choice.
 */
(function (root) {
  'use strict';
  var queued = [], privacy = null;
  function submit(choice) {
    if (!privacy || !choice) return;
    privacy.setTrackingConsent({
      analytics: choice.analytics === true,
      marketing: choice.marketing === true && !(root.navigator && root.navigator.globalPrivacyControl),
      preferences: choice.preferences === true
    }, function (error) {
      if (error && root.console) root.console.warn('[Brendigo] Shopify consent update failed.');
    });
  }
  root.BrendigoShopifyPrivacyBridge = {
    apply: function (choice) {
      if (!choice) return;
      var data = {analytics:choice.analytics === true,
        marketing:choice.marketing === true,preferences:choice.preferences === true};
      if (privacy) submit(data);
      else queued.push(data);
    }
  };
  // The storefront may not expose the API (editor, headless, restricted theme).
  // Do not guess cookie formats or write Shopify-owned privacy cookies directly.
  if (!root.Shopify || typeof root.Shopify.loadFeatures !== 'function') return;
  root.Shopify.loadFeatures(
    [{name:'consent-tracking-api',version:'0.2'}],
    function (error) {
      if (error || !root.Shopify.customerPrivacy) return;
      privacy = root.Shopify.customerPrivacy;
      queued.splice(0).forEach(submit);
    }
  );
})(window);
