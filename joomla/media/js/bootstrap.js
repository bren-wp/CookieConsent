/* Brendigo CookieConsent: configuration supplied through Joomla's script options. */
(function (root) {
  'use strict';
  var options = root.Joomla && typeof root.Joomla.getOptions === 'function'
    ? root.Joomla.getOptions('brendigoCookieConsent', null) : null;
  if (options && typeof options === 'object') root.BCC_SITE_CONFIG = options;
})(window);
