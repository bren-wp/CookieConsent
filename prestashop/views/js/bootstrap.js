/* CookieConsent by Brendigo — inert CMS JSON configuration bootstrap. */
(function (root) {
  'use strict';
  var doc = root.document;
  if (!doc || root.BCC_SITE_CONFIG) return;
  var node = doc.getElementById('brendigo-cookieconsent-config');
  if (!node) return;
  var raw = node.textContent || '';
  if (!raw || raw.length > 131072) return;
  try {
    var config = JSON.parse(raw);
    if (config && typeof config === 'object' && !Array.isArray(config))
      root.BCC_SITE_CONFIG = config;
  } catch (_) { /* Invalid configuration must not execute code. */ }
})(window);
