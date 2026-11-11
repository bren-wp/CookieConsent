/*!
 * CookieConsent by Brendigo — v0.11.5
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

  var VERSION = '0.11.5';
  var CATEGORIES = ['necessary', 'preferences', 'analytics', 'marketing'];
  var POSITIONS = ['bottom-center', 'bottom-left', 'bottom-right',
    'bottom-bar', 'top-center', 'top-left', 'top-right', 'top-bar', 'center'];
  function sanitizePosition(position) {
    return POSITIONS.indexOf(position) !== -1 ? position : 'bottom-center';
  }

  var STYLES = ['standard', 'compact', 'minimal'];
  var THEMES = ['custom', 'light', 'dark'];
  function sanitizeTheme(theme) { return THEMES.indexOf(theme) !== -1 ? theme : 'custom'; }
  function sanitizePreferencesPosition(value) {
    return ['center', 'left', 'right'].indexOf(value) !== -1 ? value : 'center';
  }
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
      reopen: 'Postavke kolačića', servicesHeading: 'Usluge i kolačići', providerPolicy: 'Privatnost pružatelja', receipt: 'Preuzmi potvrdu mog odabira'
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
      reopen: 'Cookie settings', servicesHeading: 'Services and cookies', providerPolicy: 'Provider privacy policy', receipt: 'Download my consent receipt'
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
      providerPolicy: 'Datenschutz des Anbieters', receipt: 'Meine Einwilligungsbestätigung herunterladen'
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
      providerPolicy: 'Privacy del fornitore', receipt: 'Scarica la ricevuta del consenso'
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
      providerPolicy: 'سياسة خصوصية مزوّد الخدمة', receipt: 'تنزيل نسخة من اختياري'
    },
    es: {
      heading: 'Tu privacidad, tu elección.',
      intro: 'Utilizamos cookies necesarias para el funcionamiento del sitio. Solo usamos tecnologías opcionales con tu consentimiento. Puedes cambiar tu elección en cualquier momento.',
      accept: 'Aceptar todo', reject: 'Rechazar todo', settings: 'Personalizar',
      headingPrefs: 'Preferencias de privacidad', descriptionPrefs: 'Elige las categorías permitidas. Las cookies necesarias permanecen activadas.',
      save: 'Guardar selección', close: 'Cerrar', policy: 'Política de cookies',
      necessary: 'Necesarias', preferences: 'Funcionales', analytics: 'Analíticas', marketing: 'Marketing',
      necessaryDesc: 'Necesarias para las funciones básicas y la seguridad.',
      preferencesDesc: 'Recuerdan la configuración opcional.',
      analyticsDesc: 'Ayudan a comprender el uso del sitio.',
      marketingDesc: 'Se usan para publicidad y medición de campañas.',
      gpc: 'Global Privacy Control está activo. El marketing permanece desactivado.',
      reopen: 'Configurar cookies', servicesHeading: 'Servicios y cookies',
      providerPolicy: 'Privacidad del proveedor', receipt: 'Descargar comprobante de mi elección'
    },
    fr: {
      heading: 'Votre vie privée, votre choix.',
      intro: 'Nous utilisons des cookies nécessaires au fonctionnement du site. Les technologies facultatives ne sont utilisées qu’avec votre consentement, que vous pouvez modifier à tout moment.',
      accept: 'Tout accepter', reject: 'Tout refuser', settings: 'Personnaliser',
      headingPrefs: 'Préférences de confidentialité', descriptionPrefs: 'Choisissez les catégories autorisées. Les cookies nécessaires restent activés.',
      save: 'Enregistrer mes choix', close: 'Fermer', policy: 'Politique des cookies',
      necessary: 'Nécessaires', preferences: 'Fonctionnels', analytics: 'Analytiques', marketing: 'Marketing',
      necessaryDesc: 'Nécessaires aux fonctions de base et à la sécurité.',
      preferencesDesc: 'Conservent les paramètres facultatifs.',
      analyticsDesc: 'Aident à comprendre l’utilisation du site.',
      marketingDesc: 'Servent à la publicité et à la mesure des campagnes.',
      gpc: 'Global Privacy Control est activé. Le marketing reste désactivé.',
      reopen: 'Paramètres des cookies', servicesHeading: 'Services et cookies',
      providerPolicy: 'Confidentialité du fournisseur', receipt: 'Télécharger mon récapitulatif de consentement'
    }
  };
  var config = null;
  var consent = null;
  var nodes = {};
  var lastFocused = null;
  var listenersAttached = false;
  var lastDecisionAt = null;
  var syncChannel = null;
  var syncStorageAttached = false;
  var syncCounter = 0;
  var serviceConsent = Object.create(null);
  var providers = Object.create(null);
  var providerStates = Object.create(null);
  function normalizeServices(items) {
    if (!Array.isArray(items)) return [];
    var seen = Object.create(null);
    var toggleCount = 0;
    return items.slice(0, 50).filter(function (item) {
      return item && typeof item === 'object' &&
        CATEGORIES.indexOf(item.category) !== -1 &&
        typeof item.name === 'string' && item.name.trim().length > 0;
    }).map(function (item) {
      var id = typeof item.id === 'string' && /^[a-zA-Z0-9._-]{1,64}$/.test(item.id) ? item.id : '';
      if (id && seen[id]) id = '';
      if (id) seen[id] = true;
      var toggleable = !!id && item.toggleable === true && item.category !== 'necessary' && toggleCount < 24;
      if (toggleable) toggleCount++;
      return {
        id: id, toggleable: toggleable,
        category: item.category, name: item.name.trim().slice(0, 120),
        purpose: typeof item.purpose === 'string' ? item.purpose.trim().slice(0, 350) : '',
        cookies: typeof item.cookies === 'string' ? item.cookies.trim().slice(0, 300) : '',
        duration: typeof item.duration === 'string' ? item.duration.trim().slice(0, 120) : '',
        privacyUrl: typeof item.privacyUrl === 'string' ? item.privacyUrl.trim().slice(0, 500) : ''
      };
    });
  }
  function normalizeServiceChoices(categories, choices) {
    var output = Object.create(null);
    var provided = choices && typeof choices === 'object' ? choices : {};
    (config && config.services || []).forEach(function (service) {
      if (!service.toggleable) return;
      var chosen = Object.prototype.hasOwnProperty.call(provided, service.id)
        ? provided[service.id] === true : !!(categories && categories[service.category]);
      output[service.id] = !!(categories && categories[service.category] && chosen);
    });
    return output;
  }
  function hasServiceConsent(id) {
    return typeof id === 'string' && serviceConsent[id] === true;
  }
  function getServiceConsent() {
    return Object.assign({}, serviceConsent);
  }
  function safeHttpUrl(raw) {
    if (!raw || !root.URL || !root.location) return null;
    try {
      var url = new root.URL(raw, root.location.href);
      if (url.username || url.password) return null;
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
      // Never downgrade HTTPS pages to active mixed-content HTTP resources.
      if (root.location.protocol === 'https:' && url.protocol !== 'https:') return null;
      return url.href;
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
      var shouldRun = record.serviceId ? hasServiceConsent(record.serviceId) : hasConsent(record.category);
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
        providers[definition.id] ||
        (definition.serviceId && !((config && config.services || []).some(function (s) {
          return s.id === definition.serviceId && s.toggleable && s.category === definition.category;
        })))) {
      throw new TypeError('Invalid or duplicate CookieConsent provider');
    }
    var id = definition.id;
    providers[id] = { category: definition.category, serviceId: definition.serviceId || '',
      onGrant: definition.onGrant, onRevoke: definition.onRevoke };
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
  function encodeRecord(value, revision, stamp, services) {
    return encodeURIComponent(JSON.stringify({
      version: 1, revision: revision,
      date: stamp || new Date().toISOString(),
      categories: normalizeConsent(value), services: services || {}
    }));
  }
  function parseRecord(value, revision, gpc, consentDays) {
    try {
      if (typeof value !== 'string' || value.length > 14000) return null;
      var parsed = JSON.parse(decodeURIComponent(value || ''));
      if (!parsed || parsed.version !== 1 || parsed.revision !== revision ||
          !parsed.categories || typeof parsed.categories !== 'object' ||
          Array.isArray(parsed.categories) || typeof parsed.date !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(parsed.date)) return null;
      var timestamp = Date.parse(parsed.date);
      var now = Date.now();
      var days = Math.max(1, Math.min(365, Number(consentDays) || 180));
      // Respect policy retention even if a cookie is manually replayed,
      // restored from backup, or the site's duration was shortened.
      if (!Number.isFinite(timestamp) || timestamp > now + 5 * 60000 ||
          now - timestamp > days * 86400000) return null;
      return normalizeConsent(parsed.categories, gpc);
    } catch (_) { return null; }
  }
  function parseServiceRecord(value, revision, gpc, consentDays) {
    if (!parseRecord(value, revision, gpc, consentDays)) return null;
    try {
      var parsed = JSON.parse(decodeURIComponent(value));
      return parsed && parsed.services && typeof parsed.services === 'object' && !Array.isArray(parsed.services)
        ? parsed.services : null;
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
      if (part.indexOf(name) === 0) return parseRecord(part.slice(name.length), config.revision, isGpc(), config.consentDays);
    }
    return null;
  }
  function readServiceSaved() {
    var name = config.cookieName + '=';
    var parts = (root.document.cookie || '').split(';');
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (part.indexOf(name) === 0) return parseServiceRecord(part.slice(name.length), config.revision, isGpc(), config.consentDays);
    }
    return null;
  }
  function readDecisionDate() {
    var name = config.cookieName + '=';
    var parts = (root.document.cookie || '').split(';');
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (part.indexOf(name) !== 0) continue;
      var value = part.slice(name.length);
      if (!parseRecord(value, config.revision, isGpc(), config.consentDays)) return null;
      try {
        var raw = JSON.parse(decodeURIComponent(value));
        return typeof raw.date === 'string' ? raw.date : null;
      } catch (_) { return null; }
    }
    return null;
  }
  function persist() {
    var maxAge = Math.max(1, Math.min(365, Number(config.consentDays) || 180)) * 86400;
    var secure = root.location && root.location.protocol === 'https:' ? '; Secure' : '';
    root.document.cookie = config.cookieName + '=' + encodeRecord(consent, config.revision, lastDecisionAt, serviceConsent) +
      '; Path=/; Max-Age=' + maxAge + '; SameSite=Lax' + secure;
  }
  // Explicit first-party only cleanup rules: no RegExp input and no cross-origin access.
  function normalizeCleanupRules(items) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 100).filter(function (item) {
      return item && ['preferences', 'analytics', 'marketing'].indexOf(item.category) !== -1 &&
        ((typeof item.name === 'string' && /^[a-zA-Z0-9_.-]{1,120}$/.test(item.name)) ||
         (typeof item.prefix === 'string' && /^[a-zA-Z0-9_.-]{1,120}$/.test(item.prefix)));
    }).map(function (item) {
      var serviceId = typeof item.serviceId === 'string' && /^[a-zA-Z0-9._-]{1,64}$/.test(item.serviceId)
        ? item.serviceId : '';
      var rawPath = typeof item.path === 'string' ? item.path : '/';
      var path = rawPath.length <= 150 && /^\/[a-zA-Z0-9/_-]*$/.test(rawPath) ? rawPath : '/';
      return {
        category: item.category, name: typeof item.name === 'string' ? item.name : '',
        prefix: typeof item.prefix === 'string' ? item.prefix : '',
        serviceId: serviceId, path: path
      };
    });
  }
  function clearConfiguredCookies(previous, current, oldServices, nextServices) {
    if (!config || !config.cookieCleanupRules.length || !root.document) return;
    var visible = (root.document.cookie || '').split(';').map(function (part) {
      return part.trim().split('=')[0];
    }).filter(Boolean);
    config.cookieCleanupRules.forEach(function (rule) {
      if (rule.serviceId) {
        var declared = config.services.some(function (service) {
          return service.id === rule.serviceId && service.toggleable && service.category === rule.category;
        });
        if (!declared || (nextServices && nextServices[rule.serviceId])) return;
        if (previous && oldServices && !oldServices[rule.serviceId]) return;
      } else {
        if (current && current[rule.category]) return;
        // Clean on first rejection as well as explicit withdrawal.
        if (previous && !previous[rule.category]) return;
      }
      visible.forEach(function (name) {
        if (name === config.cookieName) return;
        if (!(rule.name && rule.name === name) && !(rule.prefix && name.indexOf(rule.prefix) === 0)) return;
        var secure = root.location && root.location.protocol === 'https:' ? '; Secure' : '';
        root.document.cookie = name + '=; Max-Age=0; Path=' + rule.path + '; SameSite=Lax' + secure;
      });
    });
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
        detail: { consent: getConsent(), services: getServiceConsent(), gpc: isGpc() }
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
  /**
   * A user-owned copy of the locally persisted choice, NOT an authenticated
   * proof of compliance. No identifier, IP address, remote logging or beacon.
   */
  function getConsentReceipt() {
    if (!consent || !config) return null;
    return {
      schema: 'brendigo-consent-receipt-v1',
      product: 'CookieConsent by Brendigo',
      revision: config.revision,
      decidedAt: lastDecisionAt,
      categories: getConsent(),
      services: getServiceConsent(),
      gpc: isGpc(),
      localOnly: true
    };
  }
  function downloadConsentReceipt() {
    var receipt = getConsentReceipt();
    if (!receipt || !root.document || !root.Blob || !root.URL ||
        typeof root.URL.createObjectURL !== 'function') return false;
    var blob = new root.Blob([JSON.stringify(receipt, null, 2) + '\n'],
      {type:'application/json;charset=utf-8'});
    var url = root.URL.createObjectURL(blob);
    var link = element('a');
    link.href = url;
    link.download = 'brendigo-consent-receipt.json';
    link.hidden = true;
    root.document.body.appendChild(link);
    link.click();
    link.remove();
    // Delayed release avoids an interrupted download in slower browsers.
    if (root.setTimeout) root.setTimeout(function () { root.URL.revokeObjectURL(url); }, 1000);
    return true;
  }
  function invokeHook(name, data) {
    if (!config || typeof config[name] !== 'function') return;
    try { config[name](data); }
    catch (error) {
      if (root.console && typeof root.console.error === 'function') {
        root.console.error('[CookieConsent by Brendigo] ' + name + ' callback error', error);
      }
    }
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
      var serviceId = source.getAttribute('data-bcc-service');
      if (serviceId && !hasServiceConsent(serviceId)) return;
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
      var serviceId = frame.getAttribute('data-bcc-service');
      if (serviceId && !hasServiceConsent(serviceId)) permitted = false;
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
  /**
   * Same-origin tab synchronization. The channel contains only a revision
   * notification; no consent values or identifiers are broadcast. Receiving
   * tabs reread the site's own cookie instead.
   */
  function reconcileTabConsent() {
    if (!config) return;
    var previous = getConsent();
    var previousServices = getServiceConsent();
    var next = readSaved();
    var nextServices = normalizeServiceChoices(next, readServiceSaved());
    var before = JSON.stringify([previous, previousServices]);
    var after = JSON.stringify([next, nextServices]);
    if (before === after) return;
    consent = next;
    serviceConsent = nextServices;
    lastDecisionAt = next ? readDecisionDate() : null;
    clearConfiguredCookies(previous, consent, previousServices, serviceConsent);
    emit('change');
    if ((previous && CATEGORIES.some(function (category) {
      return category !== 'necessary' && previous[category] && !(consent && consent[category]);
    })) || Object.keys(previousServices).some(function (id) {
      return previousServices[id] === true && serviceConsent[id] !== true;
    })) emit('revoked');
    syncProviders();
    applyGatedResources();
    showBanner();
    closePreferences();
    if (consent) invokeHook('onConsent', getConsentReceipt());
  }
  function listenForTabUpdates() {
    if (!config) return;
    // BroadcastChannel can be unavailable or suspended in background tabs.
    // The same-origin StorageEvent is an independent, non-sensitive fallback.
    if (!syncStorageAttached && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        var key = 'bcc-consent-update:' + config.cookieName;
        if (!event || event.key !== key || typeof event.newValue !== 'string' ||
            event.newValue.indexOf(config.revision + '|') !== 0) return;
        reconcileTabConsent();
      });
      // Reconcile when returning to a suspended/background tab. Some WebKit
      // versions coalesce or delay cross-tab storage/broadcast events.
      root.addEventListener('focus', reconcileTabConsent);
      root.addEventListener('pageshow', reconcileTabConsent);
      if (root.document && typeof root.document.addEventListener === 'function') {
        root.document.addEventListener('visibilitychange', function () {
          if (!root.document.hidden) reconcileTabConsent();
        });
      }
      syncStorageAttached = true;
    }
    if (syncChannel || !root.BroadcastChannel) return;
    try {
      syncChannel = new root.BroadcastChannel('bcc-consent:' + config.cookieName);
      syncChannel.onmessage = function (event) {
        var notice = event && event.data;
        if (!notice || notice.type !== 'updated' || notice.revision !== config.revision) return;
        reconcileTabConsent();
      };
    } catch (_) { syncChannel = null; }
  }
  function notifyOtherTabs() {
    if (!config) return;
    if (syncChannel) {
      try {
        syncChannel.postMessage({type:'updated', revision:config.revision});
      } catch (_) { /* Use the same-origin storage event fallback below. */ }
    }
    try {
      // Contains only a policy revision, timestamp and a local monotonic counter,
      // NEVER categories, service choices or visitor identifiers.
      if (root.localStorage) {
        syncCounter += 1;
        root.localStorage.setItem('bcc-consent-update:' + config.cookieName,
          config.revision + '|' + Date.now() + '|' + syncCounter);
      }
    } catch (_) { /* Storage may be unavailable or blocked by browser settings. */ }
  }
  function saveChoice(choice, services) {
    if (!config) throw new Error('Initialize CookieConsent before setting consent.');
    var previous = getConsent();
    var oldServices = getServiceConsent();
    var firstChoice = !previous;
    consent = normalizeConsent(choice, isGpc());
    serviceConsent = normalizeServiceChoices(consent, services);
    lastDecisionAt = new Date().toISOString();
    persist();
    clearConfiguredCookies(previous, consent, oldServices, serviceConsent);
    // Adapters receive the complete decision before any gated script starts.
    emit('change');
    var diff = {
      receipt: getConsentReceipt(),
      firstChoice: firstChoice,
      changedCategories: CATEGORIES.filter(function (key) {
        return !!(previous && previous[key]) !== !!consent[key];
      }),
      changedServices: Object.keys(serviceConsent).filter(function (key) {
        return !!oldServices[key] !== !!serviceConsent[key];
      })
    };
    if (firstChoice) {
      emit('first');
      invokeHook('onFirstConsent', diff.receipt);
    }
    invokeHook('onConsent', diff.receipt);
    invokeHook('onDecision', diff);
    var revokedCategories = previous && CATEGORIES.some(function (cat) {
      return previous[cat] && !consent[cat] && cat !== 'necessary';
    });
    var revokedServices = Object.keys(oldServices).some(function (id) {
      return oldServices[id] === true && serviceConsent[id] !== true;
    });
    if (revokedCategories || revokedServices) emit('revoked');
    syncProviders();
    applyGatedResources();
    showBanner();
    closePreferences();
    notifyOtherTabs();
    return getConsent();
  }
  function setConsent(choice) { return saveChoice(choice, null); }
  function setDetailedConsent(choice) {
    if (!choice || typeof choice !== 'object') throw new TypeError('Consent must be an object');
    return saveChoice(choice.categories, choice.services);
  }
  function reset() {
    if (!config) return;
    var old = getConsent();
    var oldServices = getServiceConsent();
    consent = null;
    serviceConsent = Object.create(null);
    lastDecisionAt = null;
    root.document.cookie = config.cookieName + '=; Path=/; Max-Age=0; SameSite=Lax';
    clearConfiguredCookies(old, null, oldServices, serviceConsent);
    emit('change');
    if ((old && CATEGORIES.some(function (category) { return category !== 'necessary' && old[category]; })) ||
        Object.keys(oldServices).some(function (id) { return oldServices[id]; })) emit('revoked');
    syncProviders();
    applyGatedResources(); // clears gated iframe src attributes
    showBanner();
    closePreferences();
    notifyOtherTabs();
  }
  function openPreferences() {
    if (!config || !nodes.root || nodes.overlay) return;
    var t = translations();
    var draft = normalizeConsent(consent, isGpc());
    var draftServices = Object.assign({}, serviceConsent);
    var categoryCheckboxes = {};
    lastFocused = root.document.activeElement;
    var overlay = element('div', 'bcc-overlay bcc-preferences-' + config.preferencesPosition);
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
      categoryCheckboxes[category] = checkbox;
      checkbox.addEventListener('change', function () {
        draft[category] = checkbox.checked;
        Array.prototype.forEach.call(row.querySelectorAll('[data-bcc-service-option]'), function (node) {
          node.checked = checkbox.checked;
          draftServices[node.getAttribute('data-bcc-service-option')] = checkbox.checked;
        });
      });
      var related = config.services.filter(function (service) { return service.category === category; });
      if (related.length) {
        var details = element('span', 'bcc-services');
        details.appendChild(element('span', 'bcc-services-heading', t.servicesHeading));
        related.forEach(function (service) {
          var serviceInfo = element('span', 'bcc-service');
          if (service.toggleable) {
            var serviceLabel = element('label', 'bcc-service-option');
            serviceLabel.appendChild(element('strong', '', service.name));
            var serviceSwitch = element('input');
            serviceSwitch.type = 'checkbox';
            serviceSwitch.checked = !!draftServices[service.id];
            serviceSwitch.setAttribute('data-bcc-service-option', service.id);
            serviceSwitch.setAttribute('aria-label', service.name);
            serviceSwitch.disabled = service.category === 'marketing' && isGpc();
            serviceSwitch.addEventListener('change', function () {
              draftServices[service.id] = serviceSwitch.checked;
              var relatedSwitches = row.querySelectorAll('[data-bcc-service-option]');
              var any = Array.prototype.some.call(relatedSwitches, function (control) { return control.checked; });
              draft[category] = any;
              checkbox.checked = any;
            });
            serviceLabel.appendChild(serviceSwitch);
            serviceInfo.appendChild(serviceLabel);
          } else {
            serviceInfo.appendChild(element('strong', '', service.name));
          }
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
    var reject = button(t.reject, 'bcc-primary', function () { setConsent({}); });
    var accept = button(t.accept, 'bcc-primary', function () {
      setConsent({ preferences: true, analytics: true, marketing: true });
    });
    var save = button(t.save, 'bcc-secondary', function () {
      setDetailedConsent({categories: draft, services: draftServices});
    });
    (config.flipButtons ? [accept, reject, save] : [reject, accept, save]).forEach(function (node) {
      actions.appendChild(node);
    });
    panel.appendChild(actions);
    var footer = element('div', 'bcc-footer');
    addPolicyLink(footer, t);
    if (consent) {
      var receiptButton = button(t.receipt || 'Download my consent receipt',
        'bcc-receipt-button', downloadConsentReceipt);
      footer.appendChild(receiptButton);
    }
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
    var holder = element('div', 'bcc-root bcc-position-' + config.position + ' bcc-style-' + config.bannerStyle +
      ' bcc-theme-' + config.theme + (config.equalWeightButtons ? ' bcc-equal-buttons' : '') +
      (config.disableAnimations ? ' bcc-no-motion' : ''));
    holder.setAttribute('dir', getDirection());
    var surfaceColor = config.theme === 'dark' ? '#171f34' : config.theme === 'light' ? '#ffffff' : config.surfaceColor;
    var textColor = config.theme === 'dark' ? '#f7f8ff' : config.theme === 'light' ? '#17223e' : config.textColor;
    holder.style.setProperty('--bcc-accent', config.accentColor);
    holder.style.setProperty('--bcc-button-text', accessibleText('#ffffff', config.accentColor));
    holder.style.setProperty('--bcc-bg', surfaceColor);
    holder.style.setProperty('--bcc-text', accessibleText(textColor, surfaceColor));
    holder.style.setProperty('--bcc-subtle', accessibleText('#66708c', surfaceColor));
    holder.style.setProperty('--bcc-link', accessibleText(config.accentColor, surfaceColor));
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
    var reject = button(t.reject, 'bcc-primary', function () { setConsent({}); });
    var customize = button(t.settings, 'bcc-secondary', openPreferences);
    var accept = button(t.accept, 'bcc-primary', function () {
      setConsent({ preferences: true, analytics: true, marketing: true });
    });
    (config.flipButtons ? [accept, customize, reject] : [reject, customize, accept]).forEach(function (node) {
      actions.appendChild(node);
    });
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
    // Subscription already installed during init, before DOM rendering.
    emit('ready'); // Returning consent is propagated before third-party tag activation.
    if (consent) invokeHook('onConsent', getConsentReceipt());
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

  /**
   * Safe standalone JSON import: no callbacks, code, unknown keys or remote
   * calls can be loaded from a file. This does NOT import consent decisions.
   */
  function parseConfigurationJSON(source) {
    if (typeof source !== 'string' || source.length > 65536) return null;
    var envelope;
    try { envelope = JSON.parse(source); }
    catch (_) { return null; }
    if (!envelope || Array.isArray(envelope) ||
        envelope.schema !== 'brendigo-cookieconsent-standalone-v1' ||
        !envelope.config || typeof envelope.config !== 'object' ||
        Array.isArray(envelope.config)) return null;
    var input = envelope.config, output = Object.create(null);
    var strings = ['language','direction','position','bannerStyle','theme',
      'preferencesPosition','accentColor','surfaceColor','textColor','revision','policyUrl'];
    strings.forEach(function (key) {
      if (typeof input[key] === 'string' && input[key].length <= 500) {
        output[key] = input[key];
      }
    });
    if (output.language && ['auto','hr','en','de','it','es','fr','ar'].indexOf(output.language) < 0)
      output.language = 'auto';
    if (output.direction) output.direction = sanitizeDirection(output.direction);
    if (output.position) output.position = sanitizePosition(output.position);
    if (output.bannerStyle) output.bannerStyle = sanitizeStyle(output.bannerStyle);
    if (output.theme) output.theme = sanitizeTheme(output.theme);
    if (output.preferencesPosition) output.preferencesPosition = sanitizePreferencesPosition(output.preferencesPosition);
    ['accentColor','surfaceColor','textColor'].forEach(function (key) {
      if (output[key] && !/^#[0-9a-fA-F]{6}$/.test(output[key])) delete output[key];
    });
    if (output.policyUrl && !/^(https?:\/\/|\/(?!\/))/.test(output.policyUrl)) delete output.policyUrl;
    if (output.revision) output.revision = output.revision.slice(0,40);
    ['flipButtons','equalWeightButtons','disableAnimations'].forEach(function (key) {
      if (typeof input[key] === 'boolean') output[key] = input[key];
    });
    if (Number.isInteger(input.consentDays)) {
      output.consentDays = Math.max(1, Math.min(365,input.consentDays));
    }
    if (Array.isArray(input.services)) output.services = normalizeServices(input.services);
    if (Array.isArray(input.cookieCleanupRules))
      output.cookieCleanupRules = normalizeCleanupRules(input.cookieCleanupRules);
    if (input.translations && typeof input.translations === 'object' && !Array.isArray(input.translations)) {
      var labels = ['heading','intro','accept','reject','settings','headingPrefs','descriptionPrefs',
        'save','close','policy','necessary','preferences','analytics','marketing',
        'necessaryDesc','preferencesDesc','analyticsDesc','marketingDesc',
        'gpc','reopen','servicesHeading','providerPolicy','receipt'];
      output.translations = Object.create(null);
      ['hr','en','de','it','es','fr','ar'].forEach(function (lang) {
        if (!input.translations[lang] || typeof input.translations[lang] !== 'object' ||
            Array.isArray(input.translations[lang])) return;
        var values = Object.create(null);
        labels.forEach(function (key) {
          var text = input.translations[lang][key];
          if (typeof text === 'string' && text.trim().length <= 700 && text.trim()) {
            values[key] = text.trim();
          }
        });
        if (Object.keys(values).length) output.translations[lang] = values;
      });
    }
    return output;
  }
  function initFromJSON(raw) {
    if (config) throw new Error('CookieConsent is already initialized. Reload before importing configuration.');
    var parsed = parseConfigurationJSON(raw);
    if (!parsed) throw new TypeError('Invalid Brendigo CookieConsent configuration JSON');
    return init(parsed);
  }
  /**
   * Passive local resource inventory, never transmits or auto-classifies data.
   * Unknown elements may be first-party essential files: a human must inspect.
   */
  function scanLocalResources() {
    var snapshot = auditLocal();
    // Never include URL credentials, search parameters, fragments or storage
    // values in a report. URL query strings may carry private tokens.
    function redactUrl(raw) {
      if (typeof raw !== 'string' || !raw) return '';
      try {
        var url = new root.URL(raw, root.location && root.location.href || 'https://invalid.example/');
        url.username = '';
        url.password = '';
        url.search = '';
        url.hash = '';
        return url.href.slice(0, 500);
      } catch (_) { return raw.split(/[?#]/)[0].slice(0, 500); }
    }
    function sanitized(items) {
      return items.map(function (entry) {
        return {category: entry.category, enabled: entry.enabled,
          source: redactUrl(entry.source), marked: entry.marked};
      });
    }
    var timing = [];
    if (root.document && root.performance && typeof root.performance.getEntriesByType === 'function') {
      try { timing = root.performance.getEntriesByType('resource') || []; }
      catch (_) { timing = []; }
    }
    var total = timing.length;
    var recent = Array.prototype.slice.call(timing, -100);
    var resources = recent.map(function (entry) {
      var url = redactUrl(entry.name);
      var external = null;
      try {
        external = !!(root.location && new root.URL(url).origin !== root.location.origin);
      } catch (_) { /* Invalid or browser-private URL; leave origin unknown. */ }
      return {url: url, initiator: String(entry.initiatorType || 'other').slice(0, 32),
        thirdParty: external};
    });
    return {
      schema: 'brendigo-local-audit-v2',
      collectedAt: new Date().toISOString(),
      visibility: 'browser-visible current document only; resource timing can omit requests; never scans HttpOnly/cross-origin storage/server-side activity',
      limitations: ['No HttpOnly cookie visibility', 'No cross-origin cookie or storage contents',
        'No server-to-server events', 'No guaranteed coverage of earlier or blocked requests',
        'Resource timing lists URLs only, never responses or request payloads'],
      cookies: snapshot.cookies,
      localStorage: snapshot.localStorage,
      sessionStorage: snapshot.sessionStorage,
      markedScripts: sanitized(snapshot.scripts.filter(function (r) { return r.marked; })),
      unclassifiedScripts: sanitized(snapshot.scripts.filter(function (r) { return !r.marked; })),
      markedIframes: sanitized(snapshot.iframes.filter(function (r) { return r.marked; })),
      unclassifiedIframes: sanitized(snapshot.iframes.filter(function (r) { return !r.marked; })),
      resourceRequests: resources, resourceRequestCount: total, resourceRequestTruncated: total > 100
    };
  }
  /**
   * Sanitized catalogue; it does not authorize any tracking or network requests.
   */
  function getCatalog() {
    return config ? config.services.map(function (service) {
      return Object.assign({}, service);
    }) : [];
  }
  function renderCatalog(target) {
    if (!config || !root.document) return false;
    var host = typeof target === 'string' ? root.document.querySelector(target) : target;
    if (!host || typeof host.appendChild !== 'function') return false;
    var translated = {
      hr:['Katalog kolačića i usluga','Kategorija','Pružatelj','Svrha','Kolačići','Trajanje','Politika'],
      en:['Cookie and service catalogue','Category','Provider','Purpose','Cookies','Duration','Privacy policy'],
      de:['Cookie- und Dienstekatalog','Kategorie','Anbieter','Zweck','Cookies','Dauer','Datenschutz'],
      it:['Catalogo cookie e servizi','Categoria','Fornitore','Scopo','Cookie','Durata','Privacy'],
      es:['Catálogo de cookies y servicios','Categoría','Proveedor','Finalidad','Cookies','Duración','Privacidad'],
      fr:['Catalogue des cookies et services','Catégorie','Fournisseur','Finalité','Cookies','Durée','Confidentialité'],
      ar:['كتالوج ملفات تعريف الارتباط والخدمات','الفئة','المزود','الغرض','الكوكيز','المدة','الخصوصية']
    };
    var labels = translated[getLanguage()] || translated.en;
    var table = element('table', 'bcc-catalog');
    var caption = element('caption','',labels[0]);
    table.appendChild(caption);
    var header=element('thead'), headings=element('tr'), body=element('tbody');
    labels.slice(1).forEach(function (name) {
      var th=element('th','',name);
      th.scope='col'; headings.appendChild(th);
    });
    header.appendChild(headings); table.appendChild(header);
    getCatalog().forEach(function (service) {
      var row = element('tr');
      [service.category,service.name,service.purpose,service.cookies,service.duration].forEach(function (value) {
        row.appendChild(element('td','',value || '—'));
      });
      var policy = element('td');
      var url = safeHttpUrl(service.privacyUrl);
      if (url) {
        var link=element('a','',labels[6]);
        link.href=url;link.rel='noopener noreferrer';link.target='_blank';
        policy.appendChild(link);
      } else policy.textContent='—';
      row.appendChild(policy); body.appendChild(row);
    });
    table.appendChild(body);
    host.appendChild(table);
    return true;
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
      theme: sanitizeTheme(options.theme),
      preferencesPosition: sanitizePreferencesPosition(options.preferencesPosition),
      flipButtons: options.flipButtons === true,
      equalWeightButtons: options.equalWeightButtons !== false,
      disableAnimations: options.disableAnimations === true,
      direction: sanitizeDirection(options.direction),
      accentColor: sanitizeColor(options.accentColor, '#4357e8'),
      surfaceColor: sanitizeColor(options.surfaceColor, '#ffffff'),
      textColor: sanitizeColor(options.textColor, '#17223e'),
      services: normalizeServices(options.services),
      cookieCleanupRules: normalizeCleanupRules(options.cookieCleanupRules),
      consentDays: options.consentDays || 180,
      revision: String(options.revision || '1'),
      cookieName: /^[-_a-zA-Z0-9]{1,60}$/.test(options.cookieName || '') ? options.cookieName : 'bcc_consent',
      translations: options.translations || null,
      onChange: options.onChange,
      onConsent: options.onConsent,
      onFirstConsent: options.onFirstConsent,
      onDecision: options.onDecision
    };
    consent = readSaved();
    serviceConsent = normalizeServiceChoices(consent, readServiceSaved());
    lastDecisionAt = consent ? readDecisionDate() : null;
    // Subscribe before mounting the banner: other tabs can make a decision
    // while this tab is still building its UI.
    listenForTabUpdates();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
    return api;
  }
  var api = {
    version: VERSION,
    init: init, initFromJSON: initFromJSON, getConsent: getConsent, getConsentReceipt: getConsentReceipt,
    downloadConsentReceipt: downloadConsentReceipt, hasConsent: hasConsent,
    setConsent: setConsent, setDetailedConsent: setDetailedConsent,
    getServiceConsent: getServiceConsent, hasServiceConsent: hasServiceConsent,
    reset: reset, openPreferences: openPreferences,
    registerProvider: registerProvider,
    refresh: applyGatedResources, auditLocal: auditLocal, scanLocalResources: scanLocalResources,
    getCatalog: getCatalog, renderCatalog: renderCatalog,
    utils: {
      normalizeConsent: normalizeConsent, encodeRecord: encodeRecord, parseRecord: parseRecord,
      sanitizePosition: sanitizePosition, sanitizeStyle: sanitizeStyle,
      sanitizeTheme: sanitizeTheme, sanitizePreferencesPosition: sanitizePreferencesPosition,
      sanitizeDirection: sanitizeDirection, sanitizeColor: sanitizeColor,
      contrastRatio: contrastRatio, accessibleText: accessibleText,
      normalizeServices: normalizeServices,
      normalizeCleanupRules: normalizeCleanupRules, parseServiceRecord: parseServiceRecord,
      parseConfigurationJSON: parseConfigurationJSON
    }
  };
  return api;
});
