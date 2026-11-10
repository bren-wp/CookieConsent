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
- [ ] Puni lifecycle za revokaciju i upravljanje aktivnim trackerima
- [ ] Google Consent Mode v2 (basic) integracija i testiranje redoslijeda
- [ ] WooCommerce i registrirani WP provider adapteri
- [ ] Detaljne usluge i kategorije u administratoru
- [ ] Dodatni jezici i RTL provjere

## v0.3 — upravljanje politikama
- [ ] Lokalni audit i detekcija kolačića
- [ ] Granularni katalog usluga i pravilnik po web-stranici
- [ ] Više stilova bannera i vizualni konfigurator
- [ ] Izvoz i uvoz konfiguracije

## v1.0 — stabilnost
- [ ] Browser end-to-end, security audit i accessibility audit
- [ ] Reproducibilni release ZIP paketi i validacija za zajedničke hostinge
- [ ] Dokumentirane matrice kompatibilnosti s CMS platformama
- [ ] Posebne pravne i tehničke provjere za podržane regulatorne profile

Funkcionalnost nije isto što i pravna certifikacija. Stavke pod planom nisu već implementirane.
