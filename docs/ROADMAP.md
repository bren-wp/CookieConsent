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
- [ ] WooCommerce i registrirani WP provider adapteri
- [x] Katalog usluga, kategorija, svrha, kolačića, trajanja i politika u WordPress administratoru
- [x] Dodatni jezici: DE i IT
- [ ] RTL podrška i provjera s govornim tehnologijama

## v0.3 — upravljanje politikama
- [x] Ručna lokalna dijagnostika browser-vidljivih kolačića i resursa kroz `auditLocal()`
- [ ] Potpuni automatizirani skener i detekcija HttpOnly/cross-origin/server-side praćenja
- [x] Prvi granularni katalog usluga s javnom transparentnošću po kategorijama
- [ ] Napredni katalog, pravila po geo-jurisdikciji i pojedinačna razina privole
- [x] Lokalni vizualni konfigurator: pozicije, jezici i boje
- [x] Standard, Compact i Minimal stilovi bannera u WP administraciji
- [ ] Ugrađeni interaktivni konfigurator unutar WP administracije
- [x] WordPress izvoz i uvoz JSON postavki s nonce/capability provjerom
- [ ] Samostalni import/export svih postavki za višestruke CMS sustave

## v1.0 — stabilnost
- [x] Browser end-to-end i tipkovnički regresijski testovi u Chromiumu, Firefoxu i WebKitu
- [x] Automatizirani axe-core WCAG 2.0/2.1 A/AA testovi za banner i dijalog
- [ ] Ručna provjera čitača ekrana, potpuni WCAG i produkcijska sigurnosna revizija
- [x] Deterministički ZIP paketi s provjerom istovjetnosti i CDN SHA-256 manifestom
- [ ] Validacija stvarnih shared-hosting instalacija kroz više PHP/WordPress verzija
- [ ] Dokumentirane matrice kompatibilnosti s CMS platformama
- [ ] Posebne pravne i tehničke provjere za podržane regulatorne profile

## v0.3.0 — ostvareno u ovom koraku
- [x] Lifecycle API za davanje i povlačenje privole bez vanjskih ovisnosti
- [x] Katalog pružatelja s ograničenim i sanitiziranim podacima
- [x] Njemačka i talijanska lokalizacija
- [x] WordPress opcionalno učitavanje Google Basic adaptera
- [x] Vizualni konfigurator u `demo/configurator.html` i odvojene kontrole pristanka od provider linkova
- [x] Jedinični testovi za lifecycle, provider validaciju i katalog
- [x] v0.4.0: WP izvoz/uvoz, tri izgleda bannera, local audit API, validacija URL shema i Chromium CI
- [ ] Produkcijski audit pojedinačnih servisa, sustava kolačića i poslužitelja

Funkcionalnost nije isto što i pravna certifikacija. Neoznačene stavke nisu implementirane.
