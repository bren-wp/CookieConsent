/* CookieConsent by Brendigo — PrestaShop safe JSON config. */
(function (root) {
  'use strict';
  var node = root.document.getElementById('brendigo-cookieconsent-config');
  if (!node) return;
  try {
    var value = JSON.parse(node.textContent || '');
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      root.BCC_SITE_CONFIG = value;
    }
  } catch (e) {
    if (root.console) root.console.error('[Brendigo] Invalid PrestaShop consent configuration');
  }
})(window);
