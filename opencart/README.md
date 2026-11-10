# OpenCart — CookieConsent by Brendigo

**OpenCart 4.x** native extension, `/opencart`. Author **Brendigo**, https://brendigo.com · Product https://cookie.brendigo.com.

Download `brendigo.ocmod.zip` from the GitHub Release. **The ZIP must be named `brendigo.ocmod.zip`** so OpenCart 4 installs it in `extension/brendigo/`, matching controller namespaces, storefront asset paths and event actions. In OpenCart administrator: **Extensions → Installer → Upload**, install the resulting extension; **Extensions → Extensions → Modules** install and configure **CookieConsent by Brendigo**. Save status, language, position, policy path, revision and color. The extension registers `catalog/view/common/header/after` event on install and removes it on uninstall. It injects its local assets in the standard storefront header, no direct core modifications / OCMOD rules.

Permissions must be granted to the module in **System → Users → User Groups**. Ensure event is firing in your custom theme and preview Network requests before accepting/declining. The module does not automatically intercept every tracking script or verify all payment extensions.

**OpenCart runtime installation not yet verified in CI**; check on staging before production.
© 2026 Brendigo · MIT · UI signature **by Brendigo**.
