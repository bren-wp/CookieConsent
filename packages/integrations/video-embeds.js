/*!
 * CookieConsent by Brendigo — explicit YouTube/Vimeo embed adapter.
 * Nothing is embedded or requested until the visitor grants the selected
 * BCC category/service. Revocation removes the existing iframe.
 */
(function (root) {
  'use strict';
  var doc = root.document;
  if (!doc) return;
  var records = [];
  var serial = 0;
  var allowed = {
    youtube: /^[A-Za-z0-9_-]{11}$/,
    vimeo: /^[0-9]{1,12}$/
  };
  function source(provider, id) {
    if (!allowed[provider] || !allowed[provider].test(id)) return '';
    if (provider === 'youtube') {
      return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
    }
    return 'https://player.vimeo.com/video/' + id + '?dnt=1';
  }
  function grant(record) {
    if (record.frame || !record.host.isConnected) return;
    var frame = doc.createElement('iframe');
    frame.setAttribute('title', record.title);
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.setAttribute('allow', 'fullscreen; picture-in-picture');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('data-bcc-video-frame', '');
    frame.src = record.url;
    record.host.appendChild(frame);
    record.frame = frame;
  }
  function revoke(record) {
    if (!record.frame) return;
    // about:blank ends iframe navigation; already-sent requests cannot be undone.
    record.frame.setAttribute('src', 'about:blank');
    record.frame.remove();
    record.frame = null;
  }
  function refresh() {
    var api = root.BrendigoCookieConsent;
    if (!api || typeof api.registerProvider !== 'function') return false;
    records.slice().forEach(function (record) {
      if (!record.host.isConnected) {
        record.unregister();
        revoke(record);
        records.splice(records.indexOf(record), 1);
      }
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-bcc-video][data-bcc-video-id][data-bcc-category]'), function (host) {
      if (records.some(function (record) { return record.host === host; })) return;
      var provider = host.getAttribute('data-bcc-video') || '';
      var id = host.getAttribute('data-bcc-video-id') || '';
      var category = host.getAttribute('data-bcc-category') || '';
      var serviceId = host.getAttribute('data-bcc-service') || '';
      var url = source(provider, id);
      if (!url || ['marketing','preferences'].indexOf(category) < 0 ||
          (serviceId && !/^[a-zA-Z0-9._-]{1,64}$/.test(serviceId))) return;
      var record = {host: host, url: url, frame: null,
        title: (host.getAttribute('data-bcc-video-title') || 'Embedded video').slice(0, 120),
        unregister: function () {}};
      records.push(record);
      try {
        serial++;
        record.unregister = api.registerProvider({
          id: 'bcc-video-' + serial, category: category, serviceId: serviceId,
          onGrant: function () { grant(record); },
          onRevoke: function () { revoke(record); }
        });
      } catch (_) {
        records.splice(records.indexOf(record), 1);
      }
    });
    return true;
  }
  root.BrendigoVideoEmbeds = { refresh: refresh };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', refresh);
  else refresh();
  // Late-loaded integration / changing themes may initialize BCC after this file.
  if (root.addEventListener) root.addEventListener('brendigo:consentready', refresh);
})(window);
