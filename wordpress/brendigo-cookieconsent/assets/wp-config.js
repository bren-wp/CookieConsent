/*!
 * CookieConsent by Brendigo — CSP-safe WordPress configuration reader.
 * Reads server-sanitized JSON from an inert <meta> element, not executable inline JS.
 * Must load before the core; adds no dependencies or network requests.
 */
(function (root) {
  'use strict';
  var doc = root.document;
  if (!doc || typeof doc.querySelector !== 'function') return;
  var node = doc.querySelector('meta[name="brendigo-cookieconsent-config"]');
  if (!node) return;
  var raw = node.getAttribute('content');
  if (!raw || raw.length > 131072) return;
  try {
    var config = JSON.parse(raw);
    if (!config || typeof config !== 'object' || Array.isArray(config)) return;
    // Do not overwrite an explicitly provided first-party site configuration.
    if (!root.BCC_SITE_CONFIG) root.BCC_SITE_CONFIG = config;
  } catch (_) { /* Malformed config never causes script execution or remote loading. */ }
})(window);
