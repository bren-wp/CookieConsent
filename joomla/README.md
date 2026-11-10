# Joomla — CookieConsent by Brendigo

**Joomla 5.x / PHP 8.1+** system plugin; integration source is in `/joomla`. Author **Brendigo**, https://brendigo.com · Product https://cookie.brendigo.com.

## Install
Download the `brendigo-cookieconsent-joomla.zip` release asset; Joomla administrator → System → Install Extensions → Upload Package File. Enable **System — CookieConsent by Brendigo** and configure language, banner position, policy link, revision and color. Assets live under `media/plg_system_brendigocookieconsent/` and do not require a third-party CDN.

The plugin uses a Joomla 5 service provider and `onBeforeCompileHead`. It does not auto-block scripts emitted by other Joomla extensions. Make optional scripts inert and integrate with `BrendigoCookieConsent` provider callbacks. Verify CSP and other extension order on staging. **Not yet runtime-tested on Joomla;** PHP syntax/XML and source checks are run by repository CI.

Copyright © 2026 Brendigo · MIT. The official distribution displays **by Brendigo**.
