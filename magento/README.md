# Magento Open Source / Adobe Commerce — CookieConsent by Brendigo

**Magento 2.4.x, PHP 8.1+** (check the target Commerce patch version). Author **Brendigo**, https://brendigo.com · Product https://cookie.brendigo.com.

Extract `brendigo-cookieconsent-magento.zip` under the **Magento root** into `app/code/Brendigo/CookieConsent/`. Then run:
```bash
bin/magento module:enable Brendigo_CookieConsent
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```
Configure **Stores → Configuration → General → CookieConsent by Brendigo**. This native module registers `default.xml` layout and a server-side JSON-safe config block. Its local assets load from Magento static files, without requiring a third-party CDN. For strict Content Security Policy, verify that your Magento version/theme allows non-executable JSON script blocks and local external scripts. Integrate your trackers with the consent API; this module does NOT automatically gate Magento third-party modules or checkout events.

**Runtime Magento smoke tests have not been executed;** package, XML and PHP syntax can be checked statically. Validate storefront, checkout, CSP, cache and provider lifecycle on a Magento staging shop before deploying.

Copyright © 2026 Brendigo · MIT · Official UI attribution **by Brendigo**.
