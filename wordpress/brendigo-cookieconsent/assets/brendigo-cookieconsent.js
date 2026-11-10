/*!
 * CookieConsent by Brendigo — v0.5.0
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

  var VERSION = '0.5.0';
  var CATEGORIES = ['necessary', 'preferences', 'analytics', 'marketing'];
  var POSITIONS = ['bottom-center', 'bottom-left', 'bottom-right',
    'bottom-bar', 'top-center', 'top-left', 'top-right', 'top-bar', 'center'];
  function sanitizePosition(position) {
    return POSITIONS.indexOf(position) !== -1 ? position : 'bottom-center';
  }

  var STYLES = ['standard', 'compact', 'minimal'];
  function sanitizeStyle(style) {
    return STYLES.indexOf(style) !== -1 ? style : 'standard';
  }
  function sanitizeDirection(direction) {
    return ['auto', 'ltr', 'rtl'].indexOf(direction) !== -1 ? direction : 'auto';
  }
  function sanitizeColor(value, fallback) {
    return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback;
  }
  function luminance(hex) {
    var channels = [1, 3, 5].map(function (index) {
      var x = parseInt(hex.slice(index, index + 2), 16) / 255;
      return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  function contrastRatio(first, second) {
    var a = luminance(first), b = luminance(second);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  function accessibleText(preferred, background) {
    if (contrastRatio(preferred, background) >= 4.5) return preferred;
    return contrastRatio('#ffffff', background) >= 4.5 ? '#ffffff' : '#000000';
  }
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
      reopen: 'Postavke kolačića', servicesHeading: 'Usluge i kolačići', providerPolicy: 'Privatnost pružatelja'
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
      reopen: 'Cookie settings', servicesHeading: 'Services and cookies', providerPolicy: 'Provider privacy policy'
    },
    de: {
      heading: 'Ihre Privatsphäre. Ihre Wahl.',
      intro: 'Wir verwenden notwendige Cookies für den Betrieb dieser Website. Optionale Technologien nutzen wir nur mit Ihrer Einwilligung. Sie können Ihre Auswahl jederzeit ändern.',
      accept: 'Alle akzeptieren', reject: 'Alle ablehnen', settings: 'Einstellungen',
      headingPrefs: 'Datenschutzeinstellungen', descriptionPrefs: 'Wählen Sie aus, welche Kategorien verwendet werden dürfen. Notwendige Cookies bleiben aktiviert.',
      save: 'Auswahl speichern', close: 'Schließen', policy: 'Cookie-Richtlinie',
      necessary: 'Notwendig', preferences: 'Funktional', analytics: 'Analyse', marketing: 'Marketing',
      necessaryDesc: 'Erforderlich für grundlegende Funktionen und Sicherheit.',
      preferencesDesc: 'Speichern Ihre zusätzlichen Einstellungen.',
      analyticsDesc: 'Helfen uns, die Nutzung der Website zu verstehen.',
      marketingDesc: 'Werden für Werbung und Kampagnenmessung genutzt.',
      gpc: 'Global Privacy Control ist aktiv. Marketing bleibt deaktiviert.',
      reopen: 'Cookie-Einstellungen', servicesHeading: 'Dienste und Cookies',
      providerPolicy: 'Datenschutz des Anbieters'
    },
    it: {
      heading: 'La tua privacy. La tua scelta.',
      intro: 'Utilizziamo cookie necessari al funzionamento del sito. Le tecnologie facoltative vengono utilizzate solo con il tuo consenso, modificabile in qualsiasi momento.',
      accept: 'Accetta tutti', reject: 'Rifiuta tutti', settings: 'Personalizza',
      headingPrefs: 'Preferenze sulla privacy', descriptionPrefs: 'Scegli le categorie consentite. I cookie necessari sono sempre attivi.',
      save: 'Salva le scelte', close: 'Chiudi', policy: 'Informativa sui cookie',
      necessary: 'Necessari', preferences: 'Funzionali', analytics: 'Analitici', marketing: 'Marketing',
      necessaryDesc: 'Necessari alle funzionalità di base e alla sicurezza.',
      preferencesDesc: 'Memorizzano le impostazioni facoltative.',
      analyticsDesc: 'Ci aiutano a comprendere l’utilizzo del sito.',
      marketingDesc: 'Utilizzati per pubblicità e misurazione delle campagne.',
      gpc: 'Global Privacy Control è attivo. Il marketing rimane disattivato.',
      reopen: 'Impostazioni cookie', servicesHeading: 'Servizi e cookie',
      providerPolicy: 'Privacy del fornitore'
    },
    ar: {
      heading: 'خصوصيتك، اختيارك',
      intro: 'نستخدم ملفات تعريف الارتباط الضرورية لتشغيل الموقع. ولا نستخدم التقنيات الاختيارية إلا بموافقتك. يمكنك تغيير اختيارك في أي وقت.',
      accept: 'قبول الكل', reject: 'رفض الكل', settings: 'تخصيص',
      headingPrefs: 'تفضيلات الخصوصية', descriptionPrefs: 'اختر الفئات التي تسمح بها. ملفات تعريف الارتباط الضرورية مفعّلة دائمًا.',
      save: 'حفظ اختياراتي', close: 'إغلاق', policy: 'سياسة ملفات تعريف الارتباط',
      necessary: 'ضرورية', preferences: 'وظيفية', analytics: 'تحليلية', marketing: 'تسويقية',
      necessaryDesc: 'لازمة لتشغيل الموقع وأمانه.',
      preferencesDesc: 'تتذكر إعداداتك الاختيارية.',
      analyticsDesc: 'تساعدنا على فهم كيفية استخدام الموقع.',
      marketingDesc: 'تُستخدم للإعلانات وقياس الحملات.',
      gpc: 'إشارة التحكم العالمي في الخصوصية مفعّلة. تظل فئة التسويق معطّلة.',
      reopen: 'إعدادات ملفات تعريف الارتباط',
      servicesHeading: 'الخدمات وملفات تعريف الارتباط',
      providerPolicy: 'سياسة خصوصية مزوّد الخدمة'
    }
  };
  var config = null;
  var consent = null;
  var nodes = {};
  var lastFocused = null;
  var listenersAttached = false;
  var providers = Object.create(null);
  var providerStates = Object.create(null);
  function normalizeServices(items) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 50).filter(function (item) {
      return item && typeof item === 'object' &&
        CATEGORIES.indexOf(item.category) !== -1 &&
        typeof item.name === 'string' && item.name.trim().length > 0;
    }).map(function (item) {
      return {
        category: item.category,
        name: item.name.trim().slice(0, 120),
        purpose: typeof item.purpose === 'string' ? item.purpose.trim().slice(0, 350) : '',
        cookies: typeof item.cookies === 'string' ? item.cookies.trim().slice(0, 300) : '',
        duration: typeof item.duration === 'string' ? item.duration.trim().slice(0, 120) : '',
        privacyUrl: typeof item.privacyUrl === 'string' ? item.privacyUrl.trim().slice(0, 500) : ''
      };
    });
  }
  function safeHttpUrl(raw) {
    if (!raw || !root.URL || !root.location) return null;
    try {
      var url = new root.URL(raw, root.location.href);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
    } catch (_) { return null; }
  }
  function invokeProvider(record, method) {
    if (typeof record[method] !== 'function') return;
    try { record[method](getConsent()); }
    catch (err) {
      if (root.console && typeof root.console.error === 'function') root.console.error('[CookieConsent by Brendigo] Provider callback error', err);
    }
  }
  function syncProviders() {
    Object.keys(providers).forEach(function (id) {
      var record = providers[id];
      var shouldRun = hasConsent(record.category);
      var wasRunning = providerStates[id] === true;
      if (shouldRun && !wasRunning) {
        providerStates[id] = true;
        invokeProvider(record, 'onGrant');
      } else if (!shouldRun && wasRunning) {
        providerStates[id] = false;
        invokeProvider(record, 'onRevoke');
      }
    });
  }
  function registerProvider(definition) {
    if (!definition || typeof definition !== 'object' ||
        typeof definition.id !== 'string' ||
        !/^[a-zA-Z0-9._-]{1,64}$/.test(definition.id) ||
        !CATEGORIES.includes(definition.category) ||
        definition.category === 'necessary' ||
        providers[definition.id]) {
      throw new TypeError('Invalid or duplicate CookieConsent provider');
    }
    var id = definition.id;
    providers[id] = { category: definition.category, onGrant: definition.onGrant, onRevoke: definition.onRevoke };
    providerStates[id] = false;
    if (nodes.root) syncProviders();
    return function unregister() {
      if (!providers[id]) return;
      if (providerStates[id]) invokeProvider(providers[id], 'onRevoke');
      delete providers[id];
      delete providerStates[id];
    };
  }

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
  function getDirection() {
    if (config.direction !== 'auto') return config.direction;
    return getLanguage() === 'ar' || root.document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
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
  function branding(node) {
    // Product attribution cannot be disabled using public configuration.
    var link = element('a', 'bcc-credit', 'by Brendigo');
    link.href = 'https://brendigo.com';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    node.appendChild(link);
  }
  function addPolicyLink(node, t) {
    if (!config.policyUrl) return;
    var safeUrl = safeHttpUrl(config.policyUrl);
    if (!safeUrl) return;
    var link = element('a', 'bcc-policy', t.policy);
    link.href = safeUrl;
    node.appendChild(link);
  }
  function emit(type) {
    if (root.dispatchEvent && typeof root.CustomEvent === 'function') {
      root.dispatchEvent(new root.CustomEvent('brendigo:consent' + type, {
        detail: { consent: getConsent(), gpc: isGpc() }
      }));
    }
    if (type === 'change' && typeof config.onChange === 'function') {
      try { config.onChange(getConsent()); }
      catch (err) {
        if (root.console && typeof root.console.error === 'function') root.console.error('[CookieConsent by Brendigo] onChange callback error', err);
      }
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
        // Unknown schemes (javascript:, data:, blob:) and invalid URLs are never activated.
        var externalUrl = safeHttpUrl(src);
        if (!externalUrl) return;
        script.src = externalUrl;
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
      var src = safeHttpUrl(frame.getAttribute('data-bcc-src'));
      if (permitted && src && frame.getAttribute('src') !== src) frame.setAttribute('src', src);
      if ((!permitted || !src) && frame.hasAttribute('src')) frame.removeAttribute('src');
    });
  }
  /**
   * Read-only, local diagnostic snapshot. Browser limitations: HttpOnly cookies,
   * cross-origin cookies/storage, server-to-server calls and dynamically generated
   * requests cannot be discovered. Never transmits this information externally.
   */
  function auditLocal() {
    if (!root.document) return { cookies: [], localStorage: [], sessionStorage: [], scripts: [], iframes: [] };
    function storageKeys(storage) {
      var keys = [];
      try {
        if (!storage) return keys;
        for (var i = 0; i < storage.length; i++) keys.push(storage.key(i));
      } catch (_) { /* Storage access may be blocked by the browser. */ }
      return keys.filter(function (key) { return typeof key === 'string'; }).sort();
    }
    var cookies = (root.document.cookie || '').split(';').map(function (item) {
      return item.trim().split('=')[0];
    }).filter(Boolean).sort();
    function inspect(selector) {
      var result = [];
      Array.prototype.forEach.call(root.document.querySelectorAll(selector), function (node) {
        var category = node.getAttribute('data-bcc-category');
        result.push({
          category: category || null,
          enabled: category ? hasConsent(category) : null,
          source: node.getAttribute('data-bcc-src') || node.getAttribute('src') || '',
          marked: !!category
        });
      });
      return result;
    }
    return {
      cookies: cookies, localStorage: storageKeys(root.localStorage),
      sessionStorage: storageKeys(root.sessionStorage),
      scripts: inspect('script[src],script[data-bcc-category]'),
      iframes: inspect('iframe[src],iframe[data-bcc-category]')
    };
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
    // Notify consent adapters BEFORE any deferred script starts.
    emit('change');
    if (previous && CATEGORIES.some(function (cat) { return previous[cat] && !consent[cat] && cat !== 'necessary'; })) {
      emit('revoked');
    }
    syncProviders();
    applyGatedResources();
    showBanner();
    closePreferences();
    return getConsent();
  }
  function reset() {
    if (!config) return;
    var old = getConsent();
    consent = null;
    root.document.cookie = config.cookieName + '=; Path=/; Max-Age=0; SameSite=Lax';
    emit('change');
    if (old && CATEGORIES.some(function (category) { return category !== 'necessary' && old[category]; })) emit('revoked');
    syncProviders();
    applyGatedResources(); // clears gated iframe src attributes
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
      var row = element('div', 'bcc-category');
      var optionLabel = element('label', 'bcc-category-option');
      var description = element('span', 'bcc-category-description');
      description.appendChild(element('strong', '', t[category]));
      description.appendChild(element('small', '', t[category + 'Desc']));
      var checkbox = element('input');
      checkbox.type = 'checkbox';
      checkbox.checked = draft[category];
      checkbox.disabled = category === 'necessary' || (category === 'marketing' && isGpc());
      checkbox.setAttribute('aria-label', t[category]);
      checkbox.addEventListener('change', function () { draft[category] = checkbox.checked; });
      var related = config.services.filter(function (service) { return service.category === category; });
      if (related.length) {
        var details = element('span', 'bcc-services');
        details.appendChild(element('span', 'bcc-services-heading', t.servicesHeading));
        related.forEach(function (service) {
          var serviceInfo = element('span', 'bcc-service');
          serviceInfo.appendChild(element('strong', '', service.name));
          if (service.purpose) serviceInfo.appendChild(element('small', '', service.purpose));
          if (service.cookies) serviceInfo.appendChild(element('small', '', 'Cookies: ' + service.cookies));
          if (service.duration) serviceInfo.appendChild(element('small', '', service.duration));
          var url = safeHttpUrl(service.privacyUrl);
          if (url) {
            var link = element('a', 'bcc-service-policy', t.providerPolicy);
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.addEventListener('click', function (event) { event.stopPropagation(); });
            serviceInfo.appendChild(link);
          }
          details.appendChild(serviceInfo);
        });
        row.appendChild(details);
      }
      optionLabel.appendChild(description);
      optionLabel.appendChild(checkbox);
      row.insertBefore(optionLabel, row.firstChild);
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
    var holder = element('div', 'bcc-root bcc-position-' + config.position + ' bcc-style-' + config.bannerStyle);
    holder.setAttribute('dir', getDirection());
    holder.style.setProperty('--bcc-accent', config.accentColor);
    holder.style.setProperty('--bcc-button-text', accessibleText('#ffffff', config.accentColor));
    holder.style.setProperty('--bcc-bg', config.surfaceColor);
    holder.style.setProperty('--bcc-text', accessibleText(config.textColor, config.surfaceColor));
    holder.style.setProperty('--bcc-subtle', accessibleText('#66708c', config.surfaceColor));
    holder.style.setProperty('--bcc-link', accessibleText(config.accentColor, config.surfaceColor));
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
    {
      var reopen = button(t.reopen, 'bcc-reopen', openPreferences);
      reopen.setAttribute('aria-label', t.reopen);
      holder.appendChild(reopen);
      nodes.reopen = reopen;
    }
    root.document.body.appendChild(holder);
    nodes.root = holder;
    nodes.banner = banner;
    showBanner();
    emit('ready'); // Returning consent is propagated before third-party tag activation.
    syncProviders();
    applyGatedResources();
    if (!listenersAttached) {
      root.document.addEventListener('click', function (event) {
        var trigger = event.target && event.target.closest && event.target.closest('[data-bcc-open]');
        if (trigger) { event.preventDefault(); openPreferences(); }
      });
      listenersAttached = true;
    }
  }
  function init(options) {
    if (!root.document) return api;
    if (config) return api;
    options = options || {};
    config = {
      language: options.language || 'auto',
      policyUrl: typeof options.policyUrl === 'string' ? options.policyUrl : '/cookie-policy',
      position: sanitizePosition(options.position),
      bannerStyle: sanitizeStyle(options.bannerStyle),
      direction: sanitizeDirection(options.direction),
      accentColor: sanitizeColor(options.accentColor, '#4357e8'),
      surfaceColor: sanitizeColor(options.surfaceColor, '#ffffff'),
      textColor: sanitizeColor(options.textColor, '#17223e'),
      services: normalizeServices(options.services),
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
    registerProvider: registerProvider,
    refresh: applyGatedResources, auditLocal: auditLocal,
    utils: {
      normalizeConsent: normalizeConsent, encodeRecord: encodeRecord, parseRecord: parseRecord,
      sanitizePosition: sanitizePosition, sanitizeStyle: sanitizeStyle,
      sanitizeDirection: sanitizeDirection, sanitizeColor: sanitizeColor,
      contrastRatio: contrastRatio, accessibleText: accessibleText,
      normalizeServices: normalizeServices
    }
  };
  return api;
});
