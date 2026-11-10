=== CookieConsent by Brendigo ===
Contributors: bren-wp
Tags: cookie, consent, gdpr, privacy, banner
Requires at least: 6.2
Requires PHP: 7.4
Stable tag: 0.4.0
License: MIT
License URI: https://opensource.org/licenses/MIT

A self-hosted cookie consent banner and preference manager by Brendigo.

== Description ==
Displays consent choices and privacy preferences. Optional categories default to disabled.
Includes administrator settings for mandatory Brendigo attribution, banner position, colors, local/CDN delivery, consent revision and
selected WordPress registered script handles. Includes optional Google Basic adapter,
provider inventory, and HR/EN/DE/IT frontend languages.

This plugin does not automatically block unregistered inline scripts, pixels
or embedded services. Integration and legal review are still required.

== Installation ==
1. Upload the full brendigo-cookieconsent plugin folder as a ZIP.
2. Activate the plugin in WordPress.
3. Configure it under Settings -> CookieConsent.
4. Classify and gate optional trackers.

== Frequently Asked Questions ==
= Is this a certified CMP? =
No. It is an early standalone development release.

= Can the runtime operate without external services? =
Yes. All runtime assets are hosted locally.

== Changelog ==
= 0.4.0 =
* 9 banner positions and configurable background, text and accent colors.
* Mandatory visible by Brendigo attribution in distributed source.
* Optional versioned CDN hosting and Google Consent Mode Basic adapter.
* Provider inventory, DE/IT translations and consent lifecycle hooks.

== v0.5.0 ==
* Three banner styles and enhanced HTTP(S) URL gating.
* Admin-only JSON settings export and sanitized import with nonce validation.
* Local browser storage and tagged-resource audit API.
* Automated Chromium browser tests in CI.
