/*!
 * CookieConsent by Brendigo — CDN bootstrap v0.11.5
 * Load this file from https://cookie.brendigo.com/v0.11.5/loader.js
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
  // Reuse host-provided nonce in sites with strict CSP for dynamically
  // inserted stylesheet/script tags; never invent or weaken a nonce.
  var nonce = source.nonce || '';
  if (nonce) css.nonce = nonce;
  if (source.crossOrigin) css.crossOrigin = source.crossOrigin;
  if (source.referrerPolicy) css.referrerPolicy = source.referrerPolicy;
  css.addEventListener('error', function () {
    if (window.console) window.console.error('[CookieConsent by Brendigo] CDN stylesheet unavailable.');
  });
  doc.head.appendChild(css);
  var script = doc.createElement('script');
  script.src = base + 'brendigo-cookieconsent.js';
  script.async = false;
  if (nonce) script.nonce = nonce;
  if (source.crossOrigin) script.crossOrigin = source.crossOrigin;
  if (source.referrerPolicy) script.referrerPolicy = source.referrerPolicy;
  script.addEventListener('error', function () {
    if (window.console) window.console.error('[CookieConsent by Brendigo] CDN script unavailable. Use local fallback.');
  });
  doc.head.appendChild(script);
})(document);
