/* Initialize from Drupal's safely serialized drupalSettings. */
(function (root) {
  'use strict';
  var cfg = root.drupalSettings && root.drupalSettings.brendigoCookieConsent;
  if (cfg && typeof cfg === 'object') root.BCC_SITE_CONFIG = cfg;
})(window);
