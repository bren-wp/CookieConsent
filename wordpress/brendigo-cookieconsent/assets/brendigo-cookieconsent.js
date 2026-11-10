/*!
 * CookieConsent by Brendigo — v0.1.0
 * Copyright (c) 2026 Brendigo · MIT License
 * Zero-dependency, self-hosted consent manager.
 */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    root.BrendigoCookieConsent = api;
    if (root.BCC_SITE_CONFIG) api.init(root.BCC_SITE_CONFIG);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  var VERSION = '0.1.0';
  var CATEGORIES = ['necessary', 'preferences', 'analytics', 'marketing'];
  var MESSAGES = {
    hr: {
      heading: 'Vaša privatnost, vaš izbor',
      intro: 'Koristimo nužne kolačiće za rad stranice. Ostale tehnologije koristimo samo uz vašu privolu. Svoj izbor možete promijeniti u bilo kojem trenutku.',
      accept: 'Prihvati sve', reject: 'Odbij sve', settings: 'Postavke',
      headingPrefs: 'Postavke privatnosti', descriptionPrefs: 'Odaberite koje kategorije smijemo koristiti. Nužni kolačići uvijek su uključeni.',
      save: 'Spremi moj odabir', close: 'Zatvori', policy: 'Pravila o kolačićima',
      necessary: 'Nužni', preferences: 'Funkcionalni', analytics: 'Analitički', marketing: 'Marketinški',
      necessaryDesc: 'Omogućuju osnovne funkcije i sigurnost web-stranice.',
      preferencesDesc: 'Pamte dodatne postavke koje ste odabrali.',
      analyticsDesc: 'Pomažu nam razumjeti korištenje web-stranice.',
      marketingDesc: 'Koriste se za oglašavanje i mjerenje kampanja.',
      gpc: 'Signal Global Privacy Control je uključen. Marketinška kategorija ostaje isključena.',
      powered: 'by Brendigo', reopen: 'Postavke kolačića'
    },
    en: {
      heading: 'Your privacy. Your choice.',
      intro: 'We use essential cookies to operate this website. Optional technologies are used only with your consent. You can change your choice at any time.',
      accept: 'Accept all', reject: 'Reject all', settings: 'Customize',
      headingPrefs: 'Privacy preferences', descriptionPrefs: 'Choose which categories we may use. Essential cookies are always enabled.',
      save: 'Save my choices', close: 'Close', policy: 'Cookie policy',
      necessary: 'Essential', preferences: 'Functional', analytics: 'Analytics', marketing: 'Marketing',
      necessaryDesc: 'Required for core website functionality and security.',
      preferencesDesc: 'Remember optional settings you have selected.',
      analyticsDesc: 'Help us understand how the website is used.',
      marketingDesc: 'Used for advertising and campaign measurement.',
      gpc: 'Global Privacy Control is enabled. The marketing category remains disabled.',
      powered: 'by Brendigo', reopen: 'Cookie settings'
    }
  };
  var config = null;
  var consent = null;
  var nodes = {};
  var lastFocused = null;
  var listenersAttached = false;

  function normalizeConsent(input, gpc) {
    var values = input && typeof input === 'object' ? input : {};
    return {
      necessary: true,
      preferences: values.preferences === true,
      analytics: values.analytics === true,
      marketing: gpc === true ? false : values.marketing === true
    };
  }
  function encodeRecord(value, revision, stamp) {
    return encodeURIComponent(JSON.stringify({
      version: 1,
      revision: revision,
      date: stamp || new Date().toISOString(),
      categories: normalizeConsent(value)
    }));
  }
  function parseRecord(value, revision, gpc) {
    try {
      var parsed = JSON.parse(decodeURIComponent(value || ''));
      if (!parsed || parsed.version !== 1 || parsed.revision !== revision ||
          !parsed.categories || typeof parsed.categories !== 'object' ||
          typeof parsed.date !== 'string' || !Number.isFinite(Date.parse(parsed.date))) return null;
      return normalizeConsent(parsed.categories, gpc);
    } catch (_) { return null; }
  }
  function getLanguage() {
    var explicit = config.language;
    var language = explicit === 'auto' ? ((root.document.documentElement.lang || root.navigator.language || 'en').slice(0, 2)) : explicit;
    return MESSAGES[language] ? language : 'en';
  }
  function translations() {
    var language = getLanguage();
    return Object.assign({}, MESSAGES[language], config.translations && config.translations[language] || {});
  }
  function isGpc() {
    return !!(root.navigator && root.navigator.globalPrivacyControl === true);
  }
  function readSaved() {
    var name = config.cookieName + '=';
    var parts = (root.document.cookie || '').split(';');
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (part.indexOf(name) === 0) return parseRecord(part.slice(name.length), config.revision, isGpc());
    }
    return null;
  }
  function persist() {
    var maxAge = Math.max(1, Math.min(365, Number(config.consentDays) || 180)) * 86400;
    var secure = root.location && root.location.protocol === 'https:' ? '; Secure' : '';
    root.document.cookie = config.cookieName + '=' + encodeRecord(consent, config.revision) +
      '; Path=/; Max-Age=' + maxAge + '; SameSite=Lax' + secure;
  }
  function element(tag, className, text) {
    var node = root.document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  }
  function button(text, modifier, callback) {
    var node = element('button', 'bcc-button ' + modifier, text);
    node.type = 'button';
    node.addEventListener('click', callback);
    return node;
  }
  function branding(node, t) {
    if (config.showBranding === false) return;
    var link = element('a', 'bcc-credit', t.powered);
    link.href = 'https://brendigo.com';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    node.appendChild(link);
  }
  function addPolicyLink(node, t) {
    if (!config.policyUrl) return;
    var safeUrl;
    try {
      safeUrl = new root.URL(config.policyUrl, root.location.href);
      if (safeUrl.protocol !== 'http:' && safeUrl.protocol !== 'https:') return;
    } catch (_) { return; }
    var link = element('a', 'bcc-policy', t.policy);
    link.href = safeUrl.href;
    node.appendChild(link);
  }
  function emit(type) {
    if (root.dispatchEvent && typeof root.CustomEvent === 'function') {
      root.dispatchEvent(new root.CustomEvent('brendigo:consent' + type, {
        detail: { consent: getConsent(), gpc: isGpc() }
      }));
    }
    if (type === 'change' && typeof config.onChange === 'function') {
      config.onChange(getConsent());
    }
  }
  function getConsent() {
    return consent ? Object.assign({}, consent) : null;
  }
  function hasConsent(category) {
    return CATEGORIES.indexOf(category) !== -1 && (category === 'necessary' || !!(consent && consent[category]));
  }
  function applyGatedResources() {
    var doc = root.document;
    var scripts = doc.querySelectorAll('script[type="text/plain"][data-bcc-category]:not([data-bcc-activated])');
    Array.prototype.forEach.call(scripts, function (source) {
      var category = source.getAttribute('data-bcc-category');
      if (!hasConsent(category)) return;
      var script = doc.createElement('script');
      ['nonce', 'integrity', 'crossorigin', 'referrerpolicy'].forEach(function (attribute) {
        var value = source.getAttribute('data-bcc-' + attribute);
        if (value) script.setAttribute(attribute, value);
      });
      var src = source.getAttribute('data-bcc-src');
      if (src) {
        script.src = src;
        script.async = source.hasAttribute('data-bcc-async');
      } else {
        script.textContent = source.textContent;
      }
      source.setAttribute('data-bcc-activated', 'true');
      source.parentNode.insertBefore(script, source.nextSibling);
    });
    var frames = doc.querySelectorAll('iframe[data-bcc-category][data-bcc-src]');
    Array.prototype.forEach.call(frames, function (frame) {
      var permitted = hasConsent(frame.getAttribute('data-bcc-category'));
      var src = frame.getAttribute('data-bcc-src');
      if (permitted && frame.getAttribute('src') !== src) frame.setAttribute('src', src);
      if (!permitted && frame.hasAttribute('src')) frame.removeAttribute('src');
    });
  }
  function closePreferences() {
    if (nodes.overlay) {
      nodes.overlay.remove();
      nodes.overlay = null;
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
      lastFocused = null;
    }
  }
  function showBanner() {
    if (!nodes.banner) return;
    nodes.banner.hidden = !!consent;
    if (nodes.reopen) nodes.reopen.hidden = !consent;
  }
  function setConsent(choice) {
    if (!config) throw new Error('Initialize CookieConsent before setting consent.');
    var previous = getConsent();
    consent = normalizeConsent(choice, isGpc());
    persist();
    applyGatedResources();
    showBanner();
    closePreferences();
    emit('change');
    if (previous && CATEGORIES.some(function (cat) { return previous[cat] && !consent[cat] && cat !== 'necessary'; })) {
      emit('revoked');
    }
    return getConsent();
  }
  function reset() {
    if (!config) return;
    consent = null;
    root.document.cookie = config.cookieName + '=; Path=/; Max-Age=0; SameSite=Lax';
    showBanner();
    closePreferences();
  }
  function openPreferences() {
    if (!config || !nodes.root || nodes.overlay) return;
    var t = translations();
    var draft = normalizeConsent(consent, isGpc());
    lastFocused = root.document.activeElement;
    var overlay = element('div', 'bcc-overlay');
    var panel = element('section', 'bcc-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'bcc-dialog-title');
    var header = element('div', 'bcc-panel-head');
    var headText = element('div');
    var heading = element('h2', '', t.headingPrefs);
    heading.id = 'bcc-dialog-title';
    headText.appendChild(heading);
    headText.appendChild(element('p', 'bcc-muted', t.descriptionPrefs));
    header.appendChild(headText);
    var closeButton = button('×', 'bcc-icon-button', closePreferences);
    closeButton.setAttribute('aria-label', t.close);
    header.appendChild(closeButton);
    panel.appendChild(header);
    var list = element('div', 'bcc-category-list');
    CATEGORIES.forEach(function (category) {
      var row = element('label', 'bcc-category');
      var description = element('span', 'bcc-category-description');
      description.appendChild(element('strong', '', t[category]));
      description.appendChild(element('small', '', t[category + 'Desc']));
      var checkbox = element('input');
      checkbox.type = 'checkbox';
      checkbox.checked = draft[category];
      checkbox.disabled = category === 'necessary' || (category === 'marketing' && isGpc());
      checkbox.setAttribute('aria-label', t[category]);
      checkbox.addEventListener('change', function () { draft[category] = checkbox.checked; });
      row.appendChild(description);
      row.appendChild(checkbox);
      list.appendChild(row);
    });
    panel.appendChild(list);
    if (isGpc()) panel.appendChild(element('p', 'bcc-notice', t.gpc));
    var actions = element('div', 'bcc-actions');
    actions.appendChild(button(t.reject, 'bcc-primary', function () { setConsent({}); }));
    actions.appendChild(button(t.accept, 'bcc-secondary', function () {
      setConsent({ preferences: true, analytics: true, marketing: true });
    }));
    actions.appendChild(button(t.save, 'bcc-primary', function () { setConsent(draft); }));
    panel.appendChild(actions);
    var footer = element('div', 'bcc-footer');
    addPolicyLink(footer, t);
    branding(footer, t);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    overlay.addEventListener('mousedown', function (event) {
      if (event.target === overlay) closePreferences();
    });
    overlay.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePreferences();
      }
      if (event.key !== 'Tab') return;
      var elements = Array.prototype.slice.call(panel.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]'));
      if (!elements.length) return;
      var first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && root.document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && root.document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    nodes.root.appendChild(overlay);
    nodes.overlay = overlay;
    panel.querySelector('button').focus();
  }
  function mount() {
    if (nodes.root) return;
    var t = translations();
    var holder = element('div', 'bcc-root');
    if (config.accentColor && /^#[0-9a-fA-F]{6}$/.test(config.accentColor)) {
      holder.style.setProperty('--bcc-accent', config.accentColor);
    }
    var banner = element('section', 'bcc-banner');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', t.heading);
    var content = element('div', 'bcc-banner-content');
    content.appendChild(element('div', 'bcc-eyebrow', 'COOKIECONSENT'));
    content.appendChild(element('h2', '', t.heading));
    content.appendChild(element('p', 'bcc-muted', t.intro));
    var footer = element('div', 'bcc-footer');
    addPolicyLink(footer, t);
    branding(footer, t);
    content.appendChild(footer);
    banner.appendChild(content);
    var actions = element('div', 'bcc-banner-actions');
    actions.appendChild(button(t.reject, 'bcc-primary', function () { setConsent({}); }));
    actions.appendChild(button(t.settings, 'bcc-secondary', openPreferences));
    actions.appendChild(button(t.accept, 'bcc-primary', function () {
      setConsent({ preferences: true, analytics: true, marketing: true });
    }));
    banner.appendChild(actions);
    holder.appendChild(banner);
    if (config.showSettingsButton) {
      var reopen = button(t.reopen, 'bcc-reopen', openPreferences);
      reopen.setAttribute('aria-label', t.reopen);
      holder.appendChild(reopen);
      nodes.reopen = reopen;
    }
    root.document.body.appendChild(holder);
    nodes.root = holder;
    nodes.banner = banner;
    showBanner();
    applyGatedResources();
    if (!listenersAttached) {
      root.document.addEventListener('click', function (event) {
        var trigger = event.target && event.target.closest && event.target.closest('[data-bcc-open]');
        if (trigger) { event.preventDefault(); openPreferences(); }
      });
      listenersAttached = true;
    }
    emit('ready');
  }
  function init(options) {
    if (!root.document) return api;
    if (config) return api;
    options = options || {};
    config = {
      language: options.language || 'auto',
      policyUrl: typeof options.policyUrl === 'string' ? options.policyUrl : '/cookie-policy',
      showBranding: options.showBranding !== false,
      showSettingsButton: options.showSettingsButton !== false,
      accentColor: options.accentColor || '#4357e8',
      consentDays: options.consentDays || 180,
      revision: String(options.revision || '1'),
      cookieName: /^[-_a-zA-Z0-9]{1,60}$/.test(options.cookieName || '') ? options.cookieName : 'bcc_consent',
      translations: options.translations || null,
      onChange: options.onChange
    };
    consent = readSaved();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
    return api;
  }
  var api = {
    version: VERSION,
    init: init, getConsent: getConsent, hasConsent: hasConsent,
    setConsent: setConsent, reset: reset, openPreferences: openPreferences,
    refresh: applyGatedResources,
    utils: { normalizeConsent: normalizeConsent, encodeRecord: encodeRecord, parseRecord: parseRecord }
  };
  return api;
});
