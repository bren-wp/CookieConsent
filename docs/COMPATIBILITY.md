# Kompatibilnost — CookieConsent by Brendigo v0.11.2

## Što se automatizirano provjerava

| Okruženje | Provjera | Granica testa |
|---|---|---|
| Chromium | first visit, privole, granularne usluge, reset, mobilni prikaz, tipkovnica, lokalni receipt i cross-tab | automatizirani scenariji, ne potpuni audit |
| Firefox | isti E2E scenariji | bez potvrde svih mogućih ekstenzija |
| WebKit | isti E2E scenariji | bez ručnih VoiceOver provjera |
| axe-core | odabrana WCAG 2.0/2.1 A/AA pravila za banner i dialog | ne zamjenjuje ručni audit |
| PHP 7.4, 8.1, 8.2, 8.3, 8.4 | sintaksa i izolirana sanitizacija WordPress postavki | dodatno se obavljaju stvarni WP 6.2/latest smoke testovi s MySQL |
| CDN/ZIP | hash datoteka, reproducibilan sadržaj i provjera paketa | nije potvrda javnog CDN hostinga |
| WordPress asseti | provjera jednakosti JS/CSS jezgre i plugina | nije sveobuhvatni integracijski test; zasebni real WP smoke testovi pokrivaju inicijalizaciju, shortcode i frontend |

Službena CI konfiguracija nalazi se u `.github/workflows/ci.yml`.

## Podržani načini uključivanja

| Platforma | Status |
|---|---|
| HTML/PHP stranice | samostalna JS/CSS integracija |
| WordPress 6.2+ | vlastiti dodatak i postavke; CI smoke testovi WP 6.2/latest prolaze; testiranje na konkretnom staging/prod hostingu još potrebno |
| WooCommerce | osnovni zaštitni adapter; svi vanjski checkout/marketing dodaci moraju se posebno provjeriti |
| Drugi CMS sustavi | moguće uključiti Vanilla CSS/JS kroz templating; nema provjerenih specifičnih adaptera |
| SPA | moguća browser-side integracija; potrebni posebni hydration/dinamički testovi |
| Shared hosting | nema obveznih Composer/runtime vanjskih ovisnosti; stvarne hosting konfiguracije nisu univerzalno provjerene |
| cookie.brendigo.com | pripremljen paket, ali DNS/TLS/deployment nisu potvrđeni |

**Uvjet produkcijske spremnosti:** ispitati stvarne servise, CSP, zahtjeve, pohranu i povlačenje odluke na konkretnoj stranici. [GO-LIVE.hr.md](GO-LIVE.hr.md).

## Audit i performance

Automatski source-audit blokira opasne dinamičke sinkove, suvišan init i pogreške u mirrorriranim assetima. Test veličine jezgre postavlja granice na JS/CSS source i gzip; to ne dokazuje brzinu na svim uređajima. [Security audit](SECURITY-AUDIT.hr.md) · [Dead-code audit](DEAD-CODE-AUDIT.hr.md).

## Novi adapteri

U v0.11.2 šest platformi ima lokalne izvorne integracije, verzionirane resurse i statički validirane instalacijske strukture. Stvarna instalacija na Joomla 5, Drupal 10/11, Shopify development shop, Magento 2.4, OpenCart 4 i PrestaShop 8/9 zasad **nije potvrđena**. [Vodič](CMS-INTEGRATIONS.hr.md).
