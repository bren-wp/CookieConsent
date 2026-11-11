# Shopify — CookieConsent by Brendigo

**Theme App Extension**, not an independently uploadable plugin ZIP. Author **Brendigo**, https://brendigo.com · Product https://cookie.brendigo.com.

## Installation
1. Create or open a Shopify **app** with Shopify CLI and permission to develop theme app extensions (requires Shopify Partners/development store).
2. Copy `shopify/extensions/brendigo-cookieconsent` into the app's `extensions/` directory.
3. Deploy with `shopify app deploy` from your registered app and release/enable the extension.
4. Merchant → Online Store → Themes → Customize → **App embeds → Consent banner → Enable**, then configure policy URL, language, revision and colors.
5. Disable any overlapping banner and validate Customer Privacy API / pixel handling in a development storefront.

The embed targets `compliance_head`, loads Shopify-hosted extension assets (Shopify CDN), and keeps executable configuration out of inline HTML: Liquid-escaped meta attributes are parsed by a local bootstrap. It synchronizes explicit visitor decisions, restored saved choices, cross-tab changes, and consent resets with `Shopify.customerPrivacy.setTrackingConsent` through Shopify's version 0.2 API. On a first visit **no consent update is sent without a decision**; when a previously recorded choice exists it is synchronized on page load. No direct changes to Shopify cookies. GPC disables marketing in the bridge. The embed cannot run inside Shopify checkout; Shopify's platform Customer Privacy API covers supported platform surfaces separately. Theme extensions also do not automatically gate every installed pixel or other apps' trackers. <https://shopify.dev/docs/api/customer-privacy>.

**Requires a registered Shopify app, actual deployment, and storefront acceptance test;** repo CI validates Liquid schema/asset copies, not a real Shopify store. Official UI displays **by Brendigo**.
