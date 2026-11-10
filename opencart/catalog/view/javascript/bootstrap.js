/* CookieConsent by Brendigo — OpenCart JSON bootstrap; no inline executable script. */
(function (root) {
  'use strict';
  var el = root.document.getElementById('brendigo-cookieconsent-config');
  if (!el) return;
  try {
    var cfg = JSON.parse(el.textContent || '');
    if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) root.BCC_SITE_CONFIG = cfg;
  } catch (_) {
    if (root.console && typeof root.console.error === 'function') {
      root.console.error('[Brendigo] Invalid OpenCart CookieConsent configuration.');
    }
  }
})(window);
