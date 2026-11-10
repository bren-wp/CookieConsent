# Shopify — CookieConsent by Brendigo

**Theme App Extension**, not an independently uploadable plugin ZIP. Author **Brendigo**, https://brendigo.com · Product https://cookie.brendigo.com.

## Installation
1. Create or open a Shopify **app** with Shopify CLI and permission to develop theme app extensions (requires Shopify Partners/development store).
2. Copy `shopify/extensions/brendigo-cookieconsent` into the app's `extensions/` directory.
3. Deploy with `shopify app deploy` from your registered app and release/enable the extension.
4. Merchant → Online Store → Themes → Customize → **App embeds → Consent banner → Enable**, then configure policy URL, language, revision and colors.
5. Disable any overlapping banner and validate Customer Privacy API / pixel handling in a development storefront.

The embed targets `compliance_head`, loads local Shopify-hosted extension assets (Shopify CDN), and synchronizes explicit local visitor decisions with `Shopify.customerPrivacy.setTrackingConsent` through Shopify's version 0.2 API. **No automatic consent transmission on page load**, no direct changes to Shopify cookies. GPC disables marketing in the bridge. The embed cannot run inside Shopify checkout; Shopify's platform Customer Privacy API covers supported platform surfaces separately. Theme extensions also do not automatically gate every installed pixel or other apps' trackers. <https://shopify.dev/docs/api/customer-privacy>.

**Requires a registered Shopify app, actual deployment, and storefront acceptance test;** repo CI validates Liquid schema/asset copies, not a real Shopify store. Official UI displays **by Brendigo**.
