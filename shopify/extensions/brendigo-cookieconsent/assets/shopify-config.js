/*!
 * CookieConsent by Brendigo — Shopify CSP-compatible configuration.
 * Parse escaped Liquid attributes without executable inline scripts.
 */
(function (root) {
  'use strict';
  var doc = root.document;
  var node = doc && doc.querySelector('meta[name="brendigo-cookieconsent-config"]');
  if (!node) return;
  function read(key, fallback) {
    return node.getAttribute('data-bcc-' + key) || fallback;
  }
  function sync(choice) {
    var bridge = root.BrendigoShopifyPrivacyBridge;
    if (bridge && typeof bridge.apply === 'function') bridge.apply(choice);
  }
  root.BCC_SITE_CONFIG = {
    language: read('language', 'auto'),
    position: read('position', 'bottom-center'),
    policyUrl: read('policy-url', '/pages/cookie-policy'),
    revision: read('revision', '1'),
    accentColor: read('accent-color', '#4357e8'),
    // Sync saved consent on return visits and all changes, including reset
    // and decisions synchronized from another tab.
    onConsent: function (receipt) {
      if (receipt && receipt.categories) sync(receipt.categories);
    },
    onChange: sync
  };
})(window);
