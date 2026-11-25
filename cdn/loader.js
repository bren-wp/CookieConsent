/*!
 * CookieConsent by Brendigo — CDN bootstrap v0.11.8
 * Load from the verified release, preferably on your own origin.
 * CDN: https://api.brendigo.com/cookieconsent/v0.11.8/loader.js
 * No analytics, beacon, fingerprinting, or consent transmission.
 */
(function (doc, win) {
  'use strict';
  var source = doc.currentScript;
  if (!source || !source.src || !doc.head || win.BrendigoCookieConsent ||
      win.__bccLoaderState) return;
  // Generated at build time from the trusted release checkout, never fetched
  // from the CDN at runtime. The unbuilt template deliberately fails closed.
  var cssPin = '__BCC_CSS_SRI__';
  var jsPin = '__BCC_JS_SRI__';
  var valid = /^sha384-[A-Za-z0-9+/]{64}$/;
  if (!valid.test(cssPin) || !valid.test(jsPin)) return;
  var version = 'v0.11.8';
  var cdn = 'https://api.brendigo.com/cookieconsent/' + version + '/';
  var here = new URL(win.location.href);
  var src = new URL(source.src, here);
  if (src.origin !== here.origin && src.href !== cdn + 'loader.js') return;
  var base = new URL('.', src).href;
  // A locally hosted bootstrap survives a total CDN outage.
  var remote = source.getAttribute('data-bcc-cdn') === 'true';
  var primary = remote ? cdn : base;
  var fallback = null;
  var raw = source.getAttribute('data-bcc-fallback');
  if (raw) {
    try {
      var candidate = new URL(raw, here);
      if (candidate.origin === here.origin && !candidate.username &&
          !candidate.password && !candidate.search && !candidate.hash &&
          candidate.pathname.endsWith('/')) fallback = candidate.href;
    } catch (_) { /* Invalid fallback is ignored, never executed. */ }
  }
  if (remote && src.origin === here.origin && !fallback) fallback = base;
  if (fallback === primary) fallback = null;
  win.__bccLoaderState = 'loading';
  function finish(state) {
    win.__bccLoaderState = state;
    win.dispatchEvent(new win.CustomEvent('brendigo:loaderstate', {detail:{state:state}}));
  }
  function secure(node, pin) {
    node.integrity = pin;
    node.crossOrigin = 'anonymous';
    node.referrerPolicy = 'no-referrer';
    if (source.nonce) node.nonce = source.nonce;
  }
  function attempt(dir, next) {
    var css = doc.createElement('link');
    // Do not activate the consent runtime before the matching stylesheet loads.
    css.rel = 'stylesheet';
    css.href = dir + 'brendigo-cookieconsent.css';
    secure(css, cssPin);
    var settled = false;
    function fail() {
      if (settled) return;
      settled = true;
      css.remove();
      if (next) attempt(next, null);
      else finish('unavailable');
    }
    css.addEventListener('error', fail, {once:true});
    css.addEventListener('load', function () {
      if (settled) return;
      var script = doc.createElement('script');
      script.src = dir + 'brendigo-cookieconsent.js';
      script.async = false;
      secure(script, jsPin);
      script.addEventListener('error', function () {
        script.remove();
        fail();
      }, {once:true});
      script.addEventListener('load', function () {
        if (settled) return;
        settled = true;
        // A fetched script that failed during execution is not retried:
        // it may have already performed side effects.
        if (win.BrendigoCookieConsent) finish('ready');
        else { css.remove(); finish('unavailable'); }
      }, {once:true});
      doc.head.appendChild(script);
    }, {once:true});
    doc.head.appendChild(css);
  }
  attempt(primary, fallback);
})(document, window);
