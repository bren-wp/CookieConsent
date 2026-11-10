# Kompatibilnost — CookieConsent by Brendigo v0.8.0

## Što se automatizirano provjerava

| Okruženje | Provjera | Granica testa |
|---|---|---|
| Chromium | first visit, privole, granularne usluge, reset, mobilni prikaz, tipkovnica, lokalni receipt i cross-tab | automatizirani scenariji, ne potpuni audit |
| Firefox | isti E2E scenariji | bez potvrde svih mogućih ekstenzija |
| WebKit | isti E2E scenariji | bez ručnih VoiceOver provjera |
| axe-core | odabrana WCAG 2.0/2.1 A/AA pravila za banner i dialog | ne zamjenjuje ručni audit |
| PHP 7.4, 8.1, 8.2, 8.3, 8.4 | sintaksa i izolirana sanitizacija WordPress postavki | bez stvarne WP instalacije |
| CDN/ZIP | hash datoteka, reproducibilan sadržaj i provjera paketa | nije potvrda javnog CDN hostinga |
| WordPress asseti | provjera jednakosti JS/CSS jezgre i plugina | nije sveobuhvatni integracijski test |

Službena CI konfiguracija nalazi se u `.github/workflows/ci.yml`.

## Podržani načini uključivanja

| Platforma | Status |
|---|---|
| HTML/PHP stranice | samostalna JS/CSS integracija |
| WordPress 6.2+ | vlastiti dodatak i postavke; testiranje na produkcijskom/staging WP-u još potrebno |
| WooCommerce | osnovni zaštitni adapter; svi vanjski checkout/marketing dodaci moraju se posebno provjeriti |
| Drugi CMS sustavi | moguće uključiti Vanilla CSS/JS kroz templating; nema provjerenih specifičnih adaptera |
| SPA | moguća browser-side integracija; potrebni posebni hydration/dinamički testovi |
| Shared hosting | nema obveznih Composer/runtime vanjskih ovisnosti; stvarne hosting konfiguracije nisu univerzalno provjerene |
| cookie.brendigo.com | pripremljen paket, ali DNS/TLS/deployment nisu potvrđeni |

**Uvjet produkcijske spremnosti:** ispitati stvarne servise, CSP, zahtjeve, pohranu i povlačenje odluke na konkretnoj stranici. [GO-LIVE.hr.md](GO-LIVE.hr.md).
