# Kompatibilnost — CookieConsent by Brendigo v0.5.0

## Izravno testirano u GitHub CI-u

| Okruženje | Provjera | Status |
|---|---|---|
| Chromium | Prvo otvaranje, accept/reject, pohrana, opoziv, iframe, devet pozicija, pet jezika, mobilni prikaz, axe-core WCAG A/AA smoke | Automatizirano |
| Firefox | Jednake E2E provjere | Automatizirano |
| WebKit | Jednake E2E provjere | Automatizirano |
| PHP 7.4, 8.1–8.4 | PHP syntax, test sanitizacije postavki, katalog pružatelja, WooCommerce zaštita (s izoliranim WordPress stubovima) | Automatizirano |
| ZIP paketi | Deterministički članovi, izvorne datoteke, fiksni timestamp, provjera sadržaja/CRC, SHA-256 | Automatizirano |
| JS i CSS jezgra | Nema obveznih runtime biblioteka | U CI-u provjereno |

## Podržani načini integracije

| Platforma | Dostupna integracija | Status |
|---|---|---|
| Statični HTML, PHP stranice | Standalone JS/CSS i opcijski CDN loader | Spremno za integracijsko testiranje na stvarnoj stranici |
| WordPress 6.2+ | Dodana administrator konfiguracija, katalog, lokalni/CDN način i ručno blokiranje registriranih skripti | **Nije testirano na punoj živoj WP instalaciji** |
| WooCommerce | Zaštita osnovnih cart/checkout script handleova; katalog standardnih kolačića | Ograničena integracija — nisu obuhvaćeni svi dodaci |
| Drupal, Joomla, Magento, drugi CMS | Vanilla skripta je namijenjena integraciji kroz template/head | Nema specifičnih službenih adaptera |
| React/Vue/Next.js aplikacije | Vanilla API dostupan nakon mounta u browseru | Potrebna ručna integracija i SSR/hydration provjera |
| Shared hosting | PHP plugin nema Composer runtime ovisnosti i koristi standardne WordPress API-je | **Stvarna instalacija i kompatibilnost hostinga nisu potvrđeni** |
| cookie.brendigo.com | Verzionirani CDN ZIP i hash manifest | **DNS, TLS i javni server nisu postavljeni kroz ovaj repozitorij** |

Zelena CI provjera **ne** dokazuje da je svaki konkretan web ispravno konfiguriran. Za produkciju su neophodni testovi na stvarnom hostingu, web pregledniku s uključenim ekstenzijama i audit svih izvora praćenja.
