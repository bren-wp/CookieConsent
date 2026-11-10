# Razvojni plan — CookieConsent by Brendigo

## v0.1 — prva funkcionalna verzija
- [x] Vanilla JS/CSS jezgra, samostalni hosting bez vanjskih runtime ovisnosti
- [x] HR/EN banner, upravljanje kategorijama, spremanje i povlačenje
- [x] GPC konzervativno onemogućava marketinšku kategoriju
- [x] Označene skripte i iframeovi
- [x] WordPress dodatak s postavkama i blokiranjem odabranih script handleova
- [x] Lokalni demo i osnovni jedinični testovi
- [ ] Potpuni browser i accessibility regresijski testovi

## v0.2 — integracije i prilagodba
- [x] Devet pozicija bannera, prilagodljive boje i automatski tekst visokog kontrasta
- [x] U službenoj distribuciji trajni by Brendigo potpis bez opcije isključivanja
- [x] Verzionirani CDN build, loader i opcija lokalni/CDN u WordPressu
- [x] Opt-in Google Consent Mode v2 Basic adapter sa zadanim denied stanjem
- [x] CI provjere za v0.2 kod i izradu CDN paketa (provjeriti aktualni run)
- [x] Integracijski hookovi `registerProvider`, `onGrant`, `onRevoke` i popravljeni `reset()`
- [ ] Potpuni cleanup vanjskih pružatelja, automatska revokacija i brisanje njihovih kolačića
- [ ] Google Consent Mode v2 (basic) integracija i testiranje redoslijeda
- [x] Ograničeni WooCommerce zaštitni adapter za košaricu/naplatu
- [ ] Napredni provider adapteri za analitiku, oglase i konkretne WP dodatke
- [x] Katalog usluga, kategorija, svrha, kolačića, trajanja i politika u WordPress administratoru
- [x] Dodatni jezici: DE i IT
- [x] RTL i arapska lokalizacija; automatski smjer ili odabir u WP-u
- [ ] Ručni testovi s čitačima ekrana

## v0.3 — upravljanje politikama
- [x] Ručna lokalna dijagnostika browser-vidljivih kolačića i resursa kroz `auditLocal()`
- [ ] Potpuni automatizirani skener i detekcija HttpOnly/cross-origin/server-side praćenja
- [x] Prvi granularni katalog usluga s javnom transparentnošću po kategorijama
- [ ] Napredni katalog, pravila po geo-jurisdikciji i pojedinačna razina privole
- [x] Lokalni vizualni konfigurator: pozicije, jezici i boje
- [x] Standard, Compact i Minimal stilovi bannera u WP administraciji
- [x] Ugrađeni WordPress live preview položaja, jezika, stila i boja
- [x] WordPress izvoz i uvoz JSON postavki s nonce/capability provjerom
- [ ] Samostalni import/export svih postavki za višestruke CMS sustave

## v1.0 — stabilnost
- [x] Browser end-to-end i tipkovnički regresijski testovi u Chromiumu, Firefoxu i WebKitu
- [x] Automatizirani axe-core WCAG 2.0/2.1 A/AA testovi za banner i dijalog
- [ ] Ručna provjera čitača ekrana, potpuni WCAG i produkcijska sigurnosna revizija
- [x] Deterministički ZIP paketi s provjerom istovjetnosti i CDN SHA-256 manifestom
- [x] Automatizirana PHP 7.4, 8.1, 8.2, 8.3 i 8.4 provjera sintakse i izoliranih WP postavki
- [ ] Stvarna instalacijska validacija na više WordPress verzija i shared-hosting konfiguracija
- [ ] Dokumentirane matrice kompatibilnosti s CMS platformama
- [x] Dokumentirana konzervativna globalna opt-in matrica i kontrolna lista
- [ ] Neovisna provjera regulatornih profila i prilagodbe stvarnoj djelatnosti

## v0.3.0 — ostvareno u ovom koraku
- [x] Lifecycle API za davanje i povlačenje privole bez vanjskih ovisnosti
- [x] Katalog pružatelja s ograničenim i sanitiziranim podacima
- [x] Njemačka i talijanska lokalizacija
- [x] WordPress opcionalno učitavanje Google Basic adaptera
- [x] Vizualni konfigurator u `demo/configurator.html` i odvojene kontrole pristanka od provider linkova
- [x] Jedinični testovi za lifecycle, provider validaciju i katalog
- [x] v0.5.0: WP izvoz/uvoz, tri izgleda bannera, local audit API, validacija URL shema i Chromium CI
- [ ] Produkcijski audit pojedinačnih servisa, sustava kolačića i poslužitelja

Funkcionalnost nije isto što i pravna certifikacija. Neoznačene stavke nisu implementirane.

## v0.5.0 — konsolidirano testno izdanje
- [x] Tri vrste bannera, devet pozicija, pet jezika i RTL
- [x] Lokalni dijagnostički API bez prijenosa podataka
- [x] JSON backup i restore u WordPress administraciji
- [x] Lokalni i verzionirani CDN distribucijski paket
- [x] WooCommerce zaštitni adapter (ograničeni opseg)
- [x] Browser e2e na Chromiumu, Firefoxu i WebKitu + axe-core automatska A/AA provjera
- [x] PHP 7.4, 8.1, 8.2, 8.3 i 8.4 izolirani testovi postavki
- [x] Reproducibilne ZIP datoteke i kriptografski SHA-256 sažeci datoteka
- [x] GitHub prerelease workflow poslije uspješne kompletne CI provjere (potvrditi izvršenje)
- [ ] Produkcijski deployment i DNS/TLS na cookie.brendigo.com
- [ ] Audit svih stvarnih integracija i potpuno brisanje third-party podataka pri opozivu
- [ ] Google Certified CMP / IAB TCF certifikacija (ovisno o primjeni)
- [ ] Neovisni pen-test, screen-reader audit i pravni pregled po jurisdikciji

**Napomena:** završetak funkcionalnih zadataka nije isto što i pravna certifikacija ili produkcijsko puštanje u rad.
