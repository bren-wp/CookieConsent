=== CookieConsent by Brendigo ===
Contributors: bren-wp
Tags: cookie, consent, privacy, preference-manager, gdpr
Requires at least: 6.2
Requires PHP: 7.4
Stable tag: 0.8.0
License: MIT
License URI: https://opensource.org/licenses/MIT

A locally hosted, customizable privacy-choice banner and preference manager from Brendigo.

== Description ==

CookieConsent by Brendigo provides default-denied optional categories, individual service choices, editable privacy texts, a visual administrator preview, and a permanent cookie-settings control.

Features:
* Nine banner locations, three layout variants, three color themes, separate preferences position.
* Seven frontend locales: Croatian, English, German, Italian, Spanish, French, Arabic (RTL).
* Optional service inventory and granular service IDs.
* Manual gating of selected registered WordPress scripts.
* First-party cookie cleanup rules, local consent receipt, cross-tab notification.
* Optional Google Consent Mode v2 Basic adapter (Google tags must be gated separately).
* WooCommerce cart/checkout handle safeguards.
* Admin-only JSON configuration import/export with capability and nonce checks.
* Always-visible "by Brendigo" credit in the official interface.
* Optional versioned CDN assets; local delivery is the default.

This plugin does NOT automatically intercept all trackers, embeds, pixels, inline scripts or server-side tracking. A legal and integration review of the website is required.

== Installation ==

1. Upload the full brendigo-cookieconsent WordPress ZIP under Plugins > Add New > Upload Plugin.
2. Activate the plugin.
3. Open Settings > CookieConsent.
4. Choose colors, position, translations, revision and policy URL.
5. Audit optional trackers and register/gate them appropriately.
6. Test first visit, accept, reject and withdrawal on a staging website.

== Frequently Asked Questions ==

= Is this plugin a legally certified CMP? =
No. It supplies technical controls but is not a certification or an automatic legal-compliance guarantee.

= Can I use this without the Brendigo CDN? =
Yes. Local delivery is the default and has no required external runtime libraries.

= Can I disable the by Brendigo credit? =
The official plugin has no setting to disable the visible credit. The MIT software license allows source modifications.

= Is WooCommerce checkout blocked? =
Core recognized cart/checkout script handles are excluded from accidental consent gating. Test your theme, extensions and gateway plugins.

= Does it collect or store users' consent on a Brendigo server? =
No central consent API is included. A user-owned first-party cookie stores their choice; optional hosting access logs depend on the selected hosting provider.

== Changelog ==

= 0.8.0 =
* Local user-readable consent receipt with JSON download.
* Same-origin tab synchronization.
* Editable banner text per language in the WordPress settings.
* Expanded documentation and regression tests.

= 0.7.0 =
* Advanced configurator, service-level consent and cleanup improvements.
* Browser and accessibility regression coverage.

= 0.6.0 =
* Visual customization, multilingual/RTL support and backend integrations.

== Upgrade Notice ==

= 0.8.0 =
Back up the WordPress configuration before upgrading. Re-test script gating, policy revision and all connected third-party services.
