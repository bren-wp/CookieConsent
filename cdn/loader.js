/*!
 * CookieConsent by Brendigo — CDN bootstrap v0.11.0
 * Load this file from https://cookie.brendigo.com/v0.11.0/loader.js
 * No analytics, beacon, fingerprinting, or consent transmission.
 */
(function (doc) {
  'use strict';
  var source = doc.currentScript;
  if (!source || !source.src) return;
  var base = new URL('.', source.src).href;
  // Explicit, version-pinned paths. Do not accept remote code locations from visitor input.
  var css = doc.createElement('link');
  css.rel = 'stylesheet';
  css.href = base + 'brendigo-cookieconsent.css';
  css.addEventListener('error', function () {
    if (window.console) window.console.error('[CookieConsent by Brendigo] CDN stylesheet unavailable.');
  });
  doc.head.appendChild(css);
  var script = doc.createElement('script');
  script.src = base + 'brendigo-cookieconsent.js';
  script.async = false;
  script.addEventListener('error', function () {
    if (window.console) window.console.error('[CookieConsent by Brendigo] CDN script unavailable. Use local fallback.');
  });
  doc.head.appendChild(script);
})(document);
