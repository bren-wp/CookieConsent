# Drupal — CookieConsent by Brendigo

**Drupal 10/11** module. Author **Brendigo**, https://brendigo.com · Product https://cookie.brendigo.com.

Install the `brendigo-cookieconsent-drupal.zip` content as `web/modules/custom/brendigo_cookieconsent` (or `modules/custom/`), then `drush en brendigo_cookieconsent -y && drush cr`. Configure at **Configuration → System → CookieConsent by Brendigo**. The module attaches its local CSS/JS via `hook_page_attachments` to public routes, safely serializing configuration with `drupalSettings` and respecting Drupal cache.

The form requires **administer site configuration**. No external runtime dependency or central consent collection. It cannot automatically prevent Drupal analytics/modules from loading trackers. Integrate optional resources before consent using `data-bcc-category` and test actual site's network traffic. **Drupal runtime integration not yet executed in CI**; static source/schema checks are available.

© 2026 Brendigo · MIT. Official UI displays **by Brendigo**.
