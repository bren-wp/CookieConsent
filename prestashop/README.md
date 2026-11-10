# PrestaShop — CookieConsent by Brendigo

**PrestaShop 8/9 module**, directory `/prestashop`. Author **Brendigo**, https://brendigo.com · Product https://cookie.brendigo.com.

Install `brendigocookieconsent-prestashop.zip` through **Modules → Module Manager → Upload a module**, then configure the enabled state, language, position, policy, revision and accent color. The module uses native `displayHeader` and `actionFrontControllerSetMedia` hooks; assets remain local in the module. For the storefront header the JSON configuration is passed in a non-executable script data block and loaded by `views/js/bootstrap.js` before the consent core.

The module does not auto-disable all analytic/advertising add-ons. Validate theme rendering order, consent gates, cookie classes, cart and checkout before production. **Not runtime-tested on an actual PrestaShop installation;** static syntax/XML/asset tests are provided in CI.

© 2026 Brendigo · MIT. Official UI displays **by Brendigo**.
